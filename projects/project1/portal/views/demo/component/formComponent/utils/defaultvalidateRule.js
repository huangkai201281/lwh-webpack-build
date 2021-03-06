/**
 * Created by Allen Liu on 2020/1/7.
 */
//key msg needRegValid validate
export default [
    {
        key:'loginInput',
        msg:'账号不能为空',
        needRegValid:true,
        validate:{
            reg:/^\d+$/,
            msg:'账号密码为数字'
        }
    },
    {
        key:'userName',
        msg:'请输入用户名'
    },
    {
        key:'passWord',
        msg:'请输入密码'
    },
    {
        key:'sex',
        msg:'请选择性别'
    },
    {
        key:'fav',
        msg:'请选择爱好'
    }
]