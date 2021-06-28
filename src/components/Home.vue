<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 左侧侧边栏区域 -->
      <el-aside :width=" isCollapse? '64px':'200px' ">
         <!-- 展开与收缩按钮 -->
        <div class="toggle-btn" @click="toggleBtn">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409BFF"
          unique-opened
          :collapse='isCollapse'
          :collapse-transition='false'
          router
          :default-active="activePath"
        >   <!-- unique-opened 是否保持一个子菜单的展开,collapse是否折叠, collapse-transition是否开启折叠动画,router是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转-->
        <!-- 一级菜单 -->  <!--:index="item.id+''" 绑定index,确保每个能够单独展开,+''是为了转换为字符串形式,因为绑定属性只接收字符串-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icnoObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState(subItem.path)">
              <!-- 二级菜单模板 -->
              <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data () {
    return {
      //左侧菜单栏的数据
      menulist:[],
      icnoObj:{
        '125' : 'iconfont icon-users',
        '103' : 'iconfont icon-tijikongjian',
        '101' : 'iconfont icon-shangpin',
        '102' : 'iconfont icon-danju',
        '145' : 'iconfont icon-baobiao'
      },
      //是否折叠
      isCollapse:false,
      //被激活的链接地址
      activePath:'',
    }
  },
  created(){
    this.getMenuList()
    this.activePath=window.sessionStorage.getItem('activePath')
  },
  methods: {
    //点击退出按钮退出登录,原理:销毁本地的token,这样后续的请求将不会携带token,并跳转到登录页
    logout() {
      //销毁本地的token
      window.sessionStorage.clear();
      //跳转到登录页
      this.$router.push("/login");
    },
    //请求左侧菜单栏的数据
    async getMenuList(){
      const {data: res} = await this.$http.get("menus");
      // console.log(res)
      //请求左侧菜单栏的数据失败后
      if(res.meta.status!==200) return this.$message.error(res.meta.msg);
      //请求左侧菜单栏的数据成功后,将请求成功的数据保存到menulist，在实现遍历
      this.menulist=res.data
      // console.log(this.menulist)  
    },
    //点击按钮，是否折
    toggleBtn(){
      this.isCollapse=!this.isCollapse
    },
    //保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath=activePath
    }
  }
};
</script>

<style scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  color: #fff;
  font-size: 18px;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header span {
  margin-left: 15px;
}
.el-aside {
  background-color: #333744;
}
.el-menu{
  border-right: none;
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
  margin-right: 15px;
}
.toggle-btn{
  color: #fff;
  text-align: center;
  background-color: #4a5064;
  line-height: 24px;
  letter-spacing: 0.2em;
  font-size: 12px;
  align-items: center;
  cursor: pointer;
}
</style>