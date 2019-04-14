//豆瓣删帖
let cheerio = require('cheerio');//引入cheerio
let $ = require('jquery')
let constant = require('./constant')
require('./base')
//Cookie
let Cookies = ''
//host
let host = constant.API_HOST
//Origin
let Origin = constant.API_HOME;
//Referer
let Referer = constant.API_GROUP_GROUP;
//参数ck
let ck = '';
let userId = ''

/**填充占位符*/
format = function (source, params) {
  if (arguments.length == 1)
	return function () {
	  let args = $.makeArray(arguments);
	  args.unshift(source);
	  return format.apply(this, args);
	};
  if (arguments.length > 2 && params.constructor != Array) {
	params = $.makeArray(arguments).slice(1);
  }
  if (params.constructor != Array) {
	params = [params];
  }
  params.forEach(function (i, n) {
	source = source.replace(new RegExp("\\%s"), i);
  });
  return source;
};

//登录(弃用)
login = function (user, psd, source, response) {
  let url = 'https://www.douban.com/accounts/login'
  superagent.post(url, {form_email: user, source: source, form_password: psd})
	  .set('Content-Type', 'application/x-www-form-urlencoded')
	  .set('Host', host)
	  .set('Referer', 'https://www.douban.com')
	  .set('Origin', Origin)
	  .redirects(0)
	  .then(res => console.log(res))
	  .catch(err => console.log(err.response.text)); // 目标内容
}
// 解析收藏列表的链接
_parse_collect_path = function (text) {
  let $ = text
  let url = $('.doulist-list a').attr('href')
  return url
}
// 解析收藏列表
_parse_collect_list = function (text) {
  let $ = text
}
//解析帖子列表
_parse_topic_list = function (text) {
  let $ = text
  let result = []
  $('.title a').each(function (index, element) {
	let $element = $(element);
	let href = $element.attr('href');
	let href_item = href.split('/');
	result.push(href_item[5]);
  });
  return result
}
//解析帖子列表详情
_parse_topic_all_info_list = function (text) {
  let $ = text
  let result = []
  $('.olt tr').each(function (index, element) {
	var obj = {}
	let $element = $(element);
	let href = $element.find('.title a').attr('href');
	let href_item = href.split('/');
	obj.id = href_item[5];
	obj.title = $element.find('.title a').attr('title');
	obj.replyCount = $element.find('.td-reply').text().replace('回应', '');
	obj.date = $element.find('.td-time').text()
	result.push(obj)
  });
  return result
}
//解析评论列表
_parse_comment_list = function (text) {
  let $ = text
  let result = [];
  let obj = {}
  $('#comments li').each(function (index, element) {
	let $element = $(element);
	result.push($element.attr('data-cid'));
  });
  let topic = $('.action-react a').attr('data-object_id')
  obj[topic] = result
  return obj
}
//获取指定topic id下的评论
get_comments_by_topic = function (topic, start = 0) {
  let url = format(constant.API_GROUP_GET_TOPIC, [topic])
  return xml(url, 'GET', {start: start}, '', Cookies)
	  .then(result => {
		return _parse_comment_list(result)
	  })
}
//删除指定帖子的所有评论
remove_comment_by_topic_and_cid = function (topic, cid) {
  let url = format(constant.API_GROUP_REMOVE_COMMENT, [topic])
  let data = {'cid': cid, 'ck': ck, 'reason': 'other_reason', 'submit': '确定'}
  return req(url, 'POST', '', data, Cookies)
	  .then(result => {

		return result.body
	  }, error => {
		console.log('错误', error.response.body.r);
		if (error.response.body.r) {
		  req(format(constant.API_GROUP_ADMIN_REMOVE_COMMENT, [topic]), 'POST', '', data, Cookies)
			  .then(result => {
				return result.body
			  })
		} else {
		  throw  error
		}
	  })
};
//删除指定帖子
remove_topic_by_topicId = function (topic) {
  let url = format(constant.API_GROUP_REMOVE_TOPIC, [topic])
  let param = {'ck': ck}
  return req(url, 'POST', param, '', Cookies)
	  .then(result => {
	    console.log('删除结果',result.body);
		return result.body
	  })
}
//获取所有帖子下的回复cid
get_all_publish_topic_cid = async function (body, start = 0) {
  let topicList = await  get_all_publish_topic(body, start)
  let allComment = []
  for (i in topicList) {
	let comment = await get_comments_by_topic(topicList[i], 0)
	allComment.push(comment)
  }
  return allComment
};

//获取个人发布帖子列表
get_all_publish_topic_list = function (body, res, start = 0) {
  Cookies = body.Cookies
  ck = body.ck
  userId = body.dbcl2
  param = [userId]
  url = format(constant.API_GROUP_LIST_USER_PUBLISHED_TOPICS, param);
  return xml(url, 'GET', {'start': start}, '', Cookies)
	  .then(result => {
		return res.json({head: {code: 0, msg: 'ok'}, data: _parse_topic_all_info_list(result)})
	  })
};
// 获取所有回复的帖子
get_all_reply_topic_list = function (body, res, start = 0) {
  Cookies = body.Cookies
  ck = body.ck
  userId = body.dbcl2
  param = [userId]
  let url = format(constant.API_GROUP_LIST_USER_COMMENTED_TOPICS, param)
  return xml(url, 'GET', {'start': start}, '', Cookies)
	  .then(result => {
		return res.json({head: {code: 0, msg: 'ok'}, data: _parse_topic_all_info_list(result)})
	  })
}
//删除评论
remove_comment = function (body, res, start = 0) {
  Cookies = body.Cookies
  ck = body.ck
  userId = body.dbcl2
  topicId = body.topicId
  get_comments_by_topic(topicId)
	  .then(function (response) {
		let obj = response;
		let k = 0
		for (i in obj) {
		  for (j in obj[i]) {
			setTimeout(function () {
			  remove_comment_by_topic_and_cid(i, obj[i][k])
				  .then(function (response) {
					console.log('删除结果', response.body);
					console.log('第' + obj[i][k] + '个评论已删除')
				  })
			  console.log('定时器', '评论' + obj[i][k]);
			  k++
			}, 8000 * j)
		  }
		}
	  })
}
// 删除帖子
remove_topic = function (body,res,start=0) {
  Cookies = body.Cookies
  ck = body.ck
  userId = body.dbcl2
  topicId = body.topicId
  res.json({head: {code: 0, msg: 'ok'}, data: remove_topic_by_topicId(topicId)})
}
get_collect_list  = async function (body,res) {
  Cookies = body.Cookies
  ck = body.ck
  userId = body.dbcl2
  param = [userId]
  let url = format(constant.API_PEOPLE_HOME, param)
  xml(url, 'GET', '', '').then(result => {
	let collectUrl = [_parse_collect_path(result)]
	xml(collectUrl,'GET').then(collectXml=>{
	  let obj = _parse_collect_list(collectXml)

	})
  })

}
module.exports = {
  login: login,
  group: {
	publish: get_all_publish_topic_list,
	reply: get_all_reply_topic_list,
	removeComment: remove_comment,
	removeTopic:remove_topic
  },
  user: {
	collectList: get_collect_list,
  }
}
