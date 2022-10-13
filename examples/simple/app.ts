import axios from '../../src'

axios({
    method: 'post',
    baseURL:'http://162.62.176.224:5000/cms',
    url:'/user/login',
    data: {
        username:'alex',
        password:'qwe123'
    }
})