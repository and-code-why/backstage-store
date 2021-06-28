<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 权限列表信息区域 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="序号" width="100"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
            <template slot-scope="scope"> <!--作用域插槽-->
              <!--{{scope.row}}代码这一行的所有请求到的数据-->
                <el-tag v-if=" scope.row.level==='0' ">一级</el-tag>
                <el-tag v-if=" scope.row.level==='1' " type="success">二级</el-tag>
                <el-tag v-if=" scope.row.level==='2' " type="warning">三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  //data
  data() {
    return {
      rightsList: [], //保存权限列表信息
    };
  },
  //created
  created() {
    this.getrightsList();
  },
  //methodes
  methods: {
    async getrightsList() {
      const { data: res } = await this.$http.get("rights/list");
      // console.log(res)
      //权限列表信息请求失败时
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      //权限列表信息请求成功后，将其保存在rightsList数组中，方便后续的渲染
      this.rightsList = res.data;
      //console.log(this.rightsList);
    },
  },
};
</script>

<style scoped>
</style>