<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表信息区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column
          type="index"
          label="序号"
          width="100px"
        ></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!--作用域插槽绑定后可不用绑定prop-->
            <!--{{scope.row}}这是这一行的数据-->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
             <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeUserById(scope.row.id)"
          ></el-button>
          <!-- 角色分配按钮 -->
          <el-tooltip
            effect="dark"
            content="角色分配"
            placement="top"
            :enterable="false"
          >
            <el-button
              type="warning"
              icon="el-icon-s-tools"
              size="mini"
            ></el-button>
          </el-tooltip>
          </template>
         
        </el-table-column>
      </el-table>
      <!-- 分页视图区域  current-page当前显示的第几页 ,page-sizes切换pagesize,每页显示多少条数据-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户对话框区域 -->
      <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <!-- 主体内容表单区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框区域 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="modifyDialog"
        width="50%"
        @close="EditDialogClose"
      >
        <!-- 修改用户对话框的表单区域 -->
        <el-form ref="editFormRef" :model="editForm"  :rules="editFormRules" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" ></el-input>
          </el-form-item>
           <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 修改用户对话框的按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="modifyDialog = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    //自定义邮箱的验证规则
    var checkEmail = (rule, value, callback) => {
      //验证邮箱的正则表达式
      const regeamil = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      //验证通过的情况
      if (regeamil.test(value)) {
        return callback();
      }
      //验证没有通过的情况
      callback(new Error("请输入正确的邮箱"));
    };
    //自定义手机号码的验证规则
    var checkMobile = (rule, value, callback) => {
      //验证手机号码的正则表达式
      const regmobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regmobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入正确的手机号码"));
    };
    //return
    return {
      queryInfo: {
        query: "",
        pagenum: 1, //页码
        pagesize: 2, //一页显示多少条数据
      },
      userlist: [], //用户列表数据
      total: 0, //一共有多少条数据
      dialogVisible: false, //控制用户添加对话框的显示或隐藏
      addForm: {
        //添加用户的表单信息
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      addFormRules: { //添加用户的表单的验证规则对象
        username: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 5,
            max: 10,
            message: "长度在 5 到 10 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editFormRules:{  //修改用户表单的验证规则对象
         email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      modifyDialog:false,  //控制修改用户对话框的显示或隐藏
      editForm:{}  //查询到的用户信息对象
    };
  },
  //created生命周期
  created() {
    this.getUserList();
  },
  //methods方法
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      //console.log(res);
      //当用户列表数据请求失败时
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表数据失败");
      //当用户列表数据请求成功后，将数据保存到定义的属性当中
      this.userlist = res.data.users;
      this.total = res.data.total;
      // console.log(this.userlist)
      // console.log(this.total)
    },
    //监听pagesize改变事件(一页显示多少条数据)
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize;
      //发生改变后，再一次发送请求
      this.getUserList();   //刷新用户信息列表
    },
    //监听页码值的改变
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听switch开关的状态改变
    async userStateChanged(userinfo) {
      // console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      // console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    //监听添加用户对话框的关闭,关闭后实现对表单的重置
    addDialogClose() {
      this.$refs.addFormRef.resetFields(); //实现对用户添加表单的重置
    },
    //添加用户对话框点击确定按钮，实现用户信息的添加
    addUser() {
      //整个表单进行校验
      this.$refs.addFormRef.validate(async (valid) => {
        //console.log(valid)   //校验通过返回true,不通过返回false
        //校验失败时
        if (!valid) return;
        //校验成功时，则发送用户添加的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);
        console.log(res);
        //添加用户信息失败
        if (res.meta.status !== 201) {
          this.$message.error("添加用户信息失败");
        }
        //添加用户信息成功后，隐藏添加用户对话框，并且需要重新获取用户列表的信息
        this.$message.success('添加用户信息成功')
        this.dialogVisible = false; //隐藏添加用户对话框
        this.getUserList(); //重新获取用户列表的信息
      });
    },
    //修改用户信息按钮
    async showEditDialog(id){
      // console.log(id)
      //根据不同的id发送请求
      const {data:res} =await this.$http.get('users/'+id)
      // console.log(res)
      //请求失败时
      if(res.meta.status!==200){
        return  this.$message.error('查询用户信息失败')
      }
      //请求成功时,将请求过来的数据保存到editForm中
      this.editForm=res.data

      this.modifyDialog=true
    },
    //监听修改用户信息对话框的关闭,关闭后实现对表单的重置
    EditDialogClose(){
      this.$refs.editFormRef.resetFields();
    },
    //修改用户对话框点击确定按钮，实现用户信息的修改
    editUser(){
      this.$refs.editFormRef.validate(async valid=>{
        // console.log(valid)
        //校验证失败时
        if(!valid) return;
        //校验证成功时,则发送网络请求
        const {data:res}=await this.$http.put('users/'+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
        // console.log(res)
        //请求失败时
        if(res.meta.status!==200){
          return this.$message.error('更新用户信息失败')
        }
        //请求成功时，隐藏修改用户对话框，并且需要重新获取用户列表的信息，并且提示更新信息成功
        this.modifyDialog=false
        this.getUserList()
        this.$message.success('更新用户信息成功')
      })
    },
    //根据ID值，删除对应的用户信息
    async removeUserById(id){
      // console.log(id)
      const resConfim=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>{  //按下取消按钮后，用于接收错误信息
          return err
        })
        //按下取消按钮后，返回字符串cancel
        //按下确认按钮后，返回字符串confirm
        console.log(resConfim) 
        //取消按钮
        if(resConfim!=="confirm"){
          return this.$message('取消成功')
        }
        //确认按钮
        const {data:res}= await this.$http.delete('users/'+id)
        console.log(res)
        //请求失败时
        if(res.meta.status!==200){
          return this.$message.error('删除用户信息失败')
        }
        //请求成功后，刷新用户列表，并且提示用户删除成功
        this.getUserList()
        this.$message.success('删除用户信息成功')
    }
  },
};
</script>

<style scoped>
</style>