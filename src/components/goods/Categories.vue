<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 添加商品按钮 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加商品</el-button>
            </el-col>
        </el-row>
        <!-- 商品分类列表区域 -->
        <tree-table class="tree_table" :data="catelist" :columns="columns" :expand-type="false" :selection-type="false" :show-row-hover="false" show-index border>
            <!-- 是否有效 -->
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted ===false"></i>
                <i class="el-icon-error" style="color:red" v-else></i>
            </template>
            <!-- 排序 -->
            <template slot="order" slot-scope="scope">
                <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
                <el-tag type="success" v-else-if="scope.row.cat_level===1" size="mini">二级</el-tag>
                <el-tag type="warning" v-else size="mini">三级</el-tag>
            </template>
            <!-- 操作 -->
            <template slot="opt" slot-scope="scope">
                <!-- {{scope.row.cat_id}} -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editFrom(scope.row.cat_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteEditFrom(scope.row.cat_id)">删除</el-button>
            </template>
        </tree-table>
        <!-- 分页区域 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCatDialogVisible"
    width="50%"
    @close="addCatDialogClose"
    >
        <!-- 添加分类的表单区域 -->
        <el-form :model="addCateForm" :rules="addCateFromRules" ref="addCateFromRef" label-width="100px">
            <el-form-item label="分类名称：" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：" >
                <el-cascader
                v-model="selectedKeys"
                :options="parentCateList"
                :props="cascaderProps"
                @change="parentCateChange"
                clearable
                >
                </el-cascader>
            </el-form-item>
        </el-form>
        <!-- 添加分类的按钮区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCatDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCat">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 编辑的对话框 -->
    <el-dialog
    title="编辑"
    :visible.sync="editFromVisible"
    width="50%"
    @close="editFromClose"
    >
    <!-- 编辑对话框的表单区域 -->
    <el-form :model="editFromModel" ref="editFromRef" :rules="addCateFromRules" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editFromModel.cat_name"></el-input>
        </el-form-item>
    </el-form>
    <!-- 编辑对话框的按钮区域 -->
    <span slot="footer">
        <el-button @click="editFromVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormPut">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data () {
      return {
          catelist:[], //存放商品分类列表的数据
          querInfo:{  //请求商品分类数据携带的参数
            type:3,  //级别
            pagenum:1, //当前页码值
            pagesize:5 //每页显示多少条数据
          },
          total:0,  //存放总的商品分类数据的条数
          columns:[  //商品分类表格各列的配置
            {
                label:'分类名称',
                prop:'cat_name',
                
            },
            {
                label:'是否有效',
                type:'template', //表示当前列为模板列
                template:'isok'  //表示当前模板列使用的模板名称，作用域插槽
            },
            {
                label:'排序',
                type:'template',
                template:'order'
            },
            {
                label:'操作',
                type:'template',
                template:'opt'
            }
          ],
          addCatDialogVisible:false, //控制添加分类对话框的显示与隐藏
          addCateForm:{ //添加分类的表单数据对象
            cat_name:'',  //添加分类表单的分类名称
            cat_pid:0,   //当前分类的父 ID
            cat_level:0   //当前分类的等级，默认添加的分类是一级分类
          },
          addCateFromRules:{ //添加分类/编辑分类表单的校验证规则对象
            cat_name:[
                { required: true, message: '请输入分类名称', trigger: 'blur' },
            ]
          },
          parentCateList:[],  //存放父级分类的所有数据
          cascaderProps:{  //Cascader级联选择器的props的配置对象
            expandTrigger: 'hover', //打开的发送
            value:'cat_id',  //指定选项的值为选项对象的某个属性值
            label:'cat_name',  //指定选项标签为选项对象的某个属性值 
            children:'children', //指定选项的子选项为选项对象的某个属性值
            checkStrictly: true  //让其可以选择第一级的分类
          },
          selectedKeys:[],  //选中的父级分类的ID数组
          editFromVisible:false, //控制编辑对话框的显示与隐藏
          editFromModel:{}, //保存根据id获取来的编辑表单的数据
      }
  },
  created(){
      this.gteCateList()
  },
  methods:{
      //获取商品分类的数据
      async gteCateList(){ 
        const {data:res} = await this.$http.get('categories',{params:this.querInfo})
        // console.log(res);
        if(res.meta.status !==200){
            return this.$message.error('获取商品分类失败')
        }
        this.catelist=res.data.result
        this.total=res.data.total
      },
      //监听pagesize的改变(每页显示多少条数据)
      handleSizeChange(newSize){
          this.querInfo.pagesize=newSize
          this.gteCateList()  //刷新商品分类的列表
      },
      //监听pagenum的改变(页码的改变)
      handleCurrentChange(newNum){
          this.querInfo.pagenum=newNum
          this.gteCateList()
      },
      //添加分类按钮
      showAddCateDialog(){
          //点击添加分类按钮，先获取父级分类的数据
          this.getParentCateList()
          //再打开添加分类的对话框
          this.addCatDialogVisible=true
      },
      //请求父级分类的数据
      async getParentCateList(){
          const {data:res} = await this.$http.get('categories',{
              params:{type:2}  //表示只获取前两级的分类数据
          })
        //   console.log(res)  请求过来的商品分类的数据
          if(res.meta.status!==200){
              return this.$message.error('获取父级分类失败')
          }
          this.parentCateList=res.data
      },
      //当级联选择器选中的值发送改变时，触发的事件
      parentCateChange(){
          console.log(this.selectedKeys);
          if(this.selectedKeys.length>0){
              //给添加分类的表单数据对象的父id赋值
              this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
              //添加到那个等级
              this.addCateForm.cat_level=this.selectedKeys.length
              return
          }else{
            //   重置父id以及分类当前层级
            this.addCateForm.cat_pid=0
            this.addCateForm.cat_level=0
          }
      },
      //添加分类的确定按钮
      addCat(){
        //   console.log(this.addCateForm)
        // 1.校验证
        this.$refs.addCateFromRef.validate(async valid=>{
            //1.1未通过校验证
            if(!valid) return
            //1.2通过校验证，发送网络请求
            const {data:res}=await this.$http.post('categories',this.addCateForm)
            //console.log(res);
            if(res.meta.status!==201){
                this.$message.error('添加分类失败')
            }
            //1.2.1提示用户添加成功
            this.$message.success('添加分类成功')
            //1.2.2刷新分类列表，重新发送网络请求
            this.gteCateList()
            //1.2.3关闭添加分类的对话框
            this.addCatDialogVisible=false
        })
      },
      //监听添加分类对话框的关闭，实现对添加分类表单的重置
      addCatDialogClose(){
          this.$refs.addCateFromRef.resetFields()
          //实现对父级分类的重置,情况保存的选中的父级分类的ID数组
          this.selectedKeys=[]
          this.addCateForm.cat_pid=0
          this.addCateForm.cat_level=0
      },
      //点击编辑按钮,根据对应的id请求对应的数据
      async editFrom(id){
          //console.log(id)
          const {data:res}=await this.$http.get('categories/'+id)
          if(res.meta.status!==200){
              this.$message.error('获取分类信息失败')
          }
          this.editFromModel=res.data
          //console.log(this.editFromModel)
          //console.log(res); 
          this.editFromVisible=true //打开编辑的对话框
      },
      //监听编辑对话框的关闭，关闭后实现对编辑对话框中表单的重置
      editFromClose(){
          this.$refs.editFromRef.resetFields()
      },
      //点击编辑对话框的确认按钮，实现分类名称的修改
      editFormPut(){
          //1.1校验证
          this.$refs.editFromRef.validate(async valid=>{
              //1.1.1校验证未通过
              if(!valid) return
              //1.1.2校验证通过，发送网络请求
              const {data:res}= await this.$http.put('categories/'+this.editFromModel.cat_id,{cat_name:this.editFromModel.cat_name})
              //console.log(res);
              if(res.meta.status!==200){
                  this.$message.error('修改分类失败')
              }
              this.$message.success('修改分类成功')
              this.gteCateList()
              //this.editFromModel=res.data  //问题：这里修改后自动折叠，影响体验
              this.editFromVisible=false
          })
      },
      //点击删除按钮，删除对应的分类
      async deleteEditFrom(id){
          const confirmResult=await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        //console.log(confirmResult);
        if(confirmResult!=='confirm'){
           return  this.$message('取消成功')
        }
        const {data:res}=await this.$http.delete('categories/'+id)
        // console.log(res)
        if(res.meta.status!==200){
            return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.gteCateList()
      }
  }
}
</script>

<style scoped>
.tree_table{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>