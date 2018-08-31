import weixin from './weixin'
import weibo from './weibo'
import { isWeixin } from '../js/util'

export default async () => {
    if (isWeixin()) {
        // await weixin.getOpenid()
        return weixin.getUserInfo()
    } else {
        return weibo.getUserInfo()
    }
}