<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 表格展开列区域 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="item2 in item1.children"
                  :key="item2.id"
                  :class="['bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRolesById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 表格数据区域 -->
        <el-table-column
          type="index"
          label="序号"
          width="100"
        ></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEdit(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-s-tools"
              size="mini"
              @click="distribution"
              >权限分配</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="dialogVisible"
        width="50%"
        @close="closeDialog"
      >
        <!-- 添加角色主体表单区域 -->
        <el-form
          ref="pushroleRef"
          :model="pushrole"
          :rules="pushroleRules"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="pushrole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="pushrole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 添加角色按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="modifyrolesVisible"
        width="50%"
        @close="closeEditDialog"
      >
        <!-- 修改角色对话框的表单区域 -->
        <el-form
          ref="editFormRef"
          label-width="80px"
          :model="editForm"
          :rules="pushroleRules"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 修改角色对话框的按钮区域 -->
        <span slot="footer">
          <el-button @click="modifyrolesVisible = false">取 消</el-button>
          <el-button type="primary" @click="editFormClick">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 权限分配对话框 -->
      <el-dialog
        title="权限分配"
        :visible.sync="distributionVisible"
        width="50%"
      >
        <!-- 树形结构 -->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="distributionVisible = false">取 消</el-button>
          <el-button type="primary" @click="distributionVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Roles",
  //data
  data() {
    return {
      rolesList: [], //角色列表数据
      dialogVisible: false, //控制添加角色对话框的显示与隐藏
      pushrole: {
        //保存添加角色表单的数据
        roleName: "", //角色名称
        roleDesc: "", //角色描述
      },
      pushroleRules: {
        //添加/修改角色表单的验证规则,由于添加和修改角色的表单一样,所有使用同样的校验证规则
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      modifyrolesVisible: false, //控制修改角色对话框的显示与隐藏
      editForm: {}, //保存根据ID获取来角色信息的数据
      distributionVisible:false,  //控制权限分配对话框的显示与隐藏
      rightsList:[],  //保存权限分配的列表信息
      treeProps:{  //树形控件保存的属性对象
        lable:'authName',
        childern:'children',
      }
    };
  },
  //created
  created() {
    this.getrolesList(); //在页面实例创建成功后,马上发送网络请求
  },
  methods: {
    //发送角色列表信息的网络请求
    async getrolesList() {
      const { data: res } = await this.$http.get("roles");
      //console.log(res)
      //请求角色列表数据失败时
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表信息失败");
      }
      //请求角色列表数据成功时
      this.rolesList = res.data;
      //console.log(this.rolesList);
    },
    //监听添加角色对话框的关闭,实现对添加角色表单的重置
    closeDialog() {
      this.$refs.pushroleRef.resetFields();
    },
    //点击添加角色对话框的添加按钮,实现角色的添加,先进行校验证,校验证通过后在发送网络请求
    addRole() {
      //对添加角色表单进行校验证,未通过返回false,通过返回true
      this.$refs.pushroleRef.validate(async (valid) => {
        // console.log(valid)
        //未通过校验证
        if (!valid) return;
        //通过校验证,发送网络请求
        const { data: res } = await this.$http.post("roles", this.pushrole);
        // console.log(res)
        //添加角色失败
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        //添加角色成功,提示用户添加成功,并且隐藏添加角色的对话框,并且更新角色列表信息
        this.$message.success("添加角色成功"); //提示用户添加成功
        this.dialogVisible = false; //隐藏添加角色的对话框
        this.getrolesList(); //更新角色列表信息
      });
    },
    //点击角色列表操作的编辑按钮,实现显示修改角色的对话框,并且根据id显示对应的角色信息
    async showEdit(id) {
      //console.log(id)  根据ID值获取不同的角色数据
      const { data: res } = await this.$http.get("roles/" + id);
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败");
      }
      this.editForm = res.data;
      // console.log(this.editForm)
      this.modifyrolesVisible = true; //展示编辑角色信息的对话框
    },
    //监听修改角色对话框的关闭,实现对添加角色表单的重置
    closeEditDialog() {
      this.$refs.editFormRef.resetFields();
    },
    //点击修改角色信息的确定按钮,实现角色信息的修改
    editFormClick() {
      this.$refs.editFormRef.validate(async (valid) => {
        //console.log(valid)
        //校验证未通过时
        if (!valid) return;
        //校验证通过时发送网络请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        );
        // console.log(res)
        if (res.meta.status !== 200) {
          this.$message.error("更新角色列表信息失败");
        }
        this.$message.success("更新角色列表信息成功");
        this.getrolesList();
        this.modifyrolesVisible = false;
      });
    },
    //点击角色列表操作的删除按钮,实现删除对应ID的角色信息
    async deleteRole(id) {
      const rescofirm = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //console.log(rescofirm)  //点击取消按钮返回字符串cancel,确认按钮返回字符串confirm
      //取消按钮
      if (rescofirm !== "confirm") {
        return this.$message("取消成功");
      }
      //确认按钮
      const { data: res } = await this.$http.delete("roles/" + id);
      // console.log(res)
      //请求删除失败
      if (res.meta.status !== 200) {
        this.$message.error("删除角色失败");
      }
      //请求删除成功,提示用户删除成功,并且更新角色列表,也就是重新发送网络请求
      this.$message.success("删除角色成功");
      this.getrolesList();
    },
    //根据ID,删除对应的取消，并且弹出是否确定取消的弹框
    async removeRolesById(role, rightId) {
      const resconfirm = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(resconfirm)
      // 点击取消按钮
      if (resconfirm !== confirm) {
        this.$message("取消成功");
      }
      // 点击确认按钮
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/$(rightId)`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      // this.getrolesList()
      role.childern = res.data;
    },
    //点击权限分配按钮
    async distribution() {
      const{data:res}=await this.$http.get('rights/tree')
      // console.log(res)
      if(res.meta.status!==200){
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList=res.data
      console.log(this.rightsList)
      this.distributionVisible=true
    },
  },
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>