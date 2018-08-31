import originJsonp from 'jsonp'

const param = (data) => {
    let params = ''

    for (let k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        params += '&' + k + '=' + encodeURIComponent(value)
    }

    return params ? params.substring(1) : ''
}
export default (options) => {
    let { url, data, option } = options
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

    return new Promise((resolve, reject) => {
        originJsonp(url, option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}