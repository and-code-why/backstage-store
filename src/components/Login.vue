<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单区域 -->
      <el-form label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
          <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
            <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
            <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data () {
      return {
          //这是登录表单的数据绑定对象
          loginForm:{
              username:'admin',
              password:'123456',
          },
          //这是登录表单登录的验证对象
          loginFormRules:{
              //验证用户名是否合法
              username:[   
                  {required: true, message: '请输入用户名称', trigger: 'blur'},  //required表示是否为必填项,trigger表示触发的时机
                  { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' } //这里是对字符长度的验证规则
              ],
              //验证密码是否合法
              password:[
                  {required: true, message: '请输入密码', trigger: 'blur'},
                  { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
              ]
          }
      }
  },
  methods:{
      //点击重置按钮,重置表单
      resetLoginForm(){
        //   console.log(this)
        this.$refs.loginFormRef.resetFields()
      },
      //点击登录按钮,进行登录的预验证,先判断用户名、密码是否合法,判断为合法在进行登录的网络请求
      login(){
          this.$refs.loginFormRef.validate(async vaild=>{  //validate(callback:Function(boolean, object))
            //   console.log(vaild)
            if(!vaild) return;
            const {data:res}= await this.$http.post('login',this.loginForm)  //{data:res}解构赋值data,只拿到data中的数据
            //console.log(res)  //如果返回为Promise,可以用await、asyns来对其进行简化,同时await只能用在被asyns(异步方法)修饰的方法中
            //登录失败时
            if(res.meta.status!==200) return this.$message.error('登录失败');  //
            //登录成功时
            this.$message.success('登录成功');
            console.log('登录成功(测试:只在发布阶段才清除所有的console.log命令)')
            //登录成功之后的操作:
            //1.当登录成功之后的token,保存到客户端的sessionStorage中
               //1.1 项目中的除了登录的其他API接口,必须在登录之后才能访问
               //1.2 token 只应该在当前网站打开期间生效,所有将token保存在sessionStorage中
            //2.通过编程式导航跳转到后台主页,路由地址为'/home'

            //将token保存到客户端的sessionStorage中
            window.sessionStorage.setItem('token',res.data.token);
            //console.log(res.data.token)

            //跳转到后台主页
            this.$router.push('/home')
          })
      }
  }
};
</script>

<style scoped>
/*scoped表示当前样式只在该组件内生效，lang="less"表示支持less语法 */
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  background-color: #fff;
  width: 450px;
  height: 300px;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.avater {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 1px solid #eee;
  padding: 8px;
  box-shadow: 0px 0px 5px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
.avater img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.btns{
    display: flex;
    justify-content: flex-end;
}
.login_form{
    position: absolute;
    bottom: 10px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;  
}
</style>