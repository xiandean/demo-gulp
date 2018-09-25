import weixin from './weixin.js'
import weibo from './weibo.js'
import { isWeixin } from '../utils/utils.js'

export default async () => {
    if (isWeixin()) {
        // await weixin.getOpenid()
        return weixin.getUserInfo()
    } else {
        return weibo.getUserInfo()
    }
}