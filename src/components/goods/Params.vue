<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 警告提示区域 -->
         <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>
         <!-- 选择商品分类区域 -->
         <el-row class="cat_opt">
             <el-col>
                 <span>选择商品分类：</span>
                 <!-- 选择商品分类的级联选择框 -->
                 <el-cascader
                  v-model="selectedCateKeys"
                  :options="cateList"
                  :props="cateProps" 
                  @change="handleChange"
                  >
                  </el-cascader>
             </el-col>
         </el-row>
         <!-- tab标签页区域 -->
         <el-tabs v-model="activeName" @tab-click="handleTabClick">
             <!-- 动态参数视图区域 -->
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isBtnDisabled" size="small" @click="addDialogVisible=true">添加参数</el-button>
                <!-- 动态参数单独表格区域 -->
                <el-table :data="manyTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column  type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                            <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                            <!-- 添加tag的按钮,可实现tag与button的切换 -->
                            <!-- input部分 -->
                            <el-input
                            class="input-new-tag"
                            v-if="scope.row.inputVisible"
                            v-model="scope.row.inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)"
                            >
                            </el-input>
                            <!-- button部分 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <!-- 序号 -->
                    <el-table-column label="序号" type="index" width="100"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <!-- 操作按钮 -->
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <!-- {{scope.row.attr_id}} -->
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDiaolog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDiaolog(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
             <!-- 静态属性视图区域 -->
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" :disabled="isBtnDisabled" size="small" @click="addDialogVisible=true">添加属性</el-button>
                <!-- 静态属性单独表格区域 -->
                <el-table :data="infoTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column  type="expand">
                         <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                            <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                            <!-- 添加tag的按钮,可实现tag与button的切换 -->
                            <!-- input部分 -->
                            <el-input
                            class="input-new-tag"
                            v-if="scope.row.inputVisible"
                            v-model="scope.row.inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)"
                            >
                            </el-input>
                            <!-- button部分 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <!-- 序号 -->
                    <el-table-column label="序号" type="index" width="100"></el-table-column>
                    <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                    <!-- 操作按钮 -->
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDiaolog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDiaolog(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>
    <!-- 添加参数\静态属性的对话框区域,二者共用一个对话框 -->
    <el-dialog
    :title="'添加'+titleText"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClose"
    >
    <!-- 添加参数对话框的表单区域 -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <!-- 添加参数对话框的按钮区域 -->
    <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 编辑按钮的修改对话框 -->
    <el-dialog
    :title="'修改'+titleText"
    :visible.sync="editDialogVisible"
    width="50%"
    @close="editDialogClose"
    >
    <!-- 编辑对话框的表单区域 -->
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <!-- 编辑对话框的按钮区域 -->
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
      return {
          cateList:[], //用于存放请求过来的商品分类的数据
          cateProps:{//级联选择器的配置对象
            expandTrigger:'hover',
            value:'cat_id',
            label:'cat_name',
            children:'children'
          },
          selectedCateKeys:[],  //级联选择框双向绑定的数组
          activeName:'many', //指定tab标签页默认选中的是那一页,用于切换
          manyTableData:[], //存放请求来的动态参数数据
          infoTableData:[],  //存放请求来的静态属性
          addDialogVisible:false, //控制添加参数\静态属性对话框的显示与隐藏
          addForm:{//存放添加属性表单的数据对象
            attr_name:''
          },
          addFormRules:{//添加属性对话框表单校验证规则对象
           attr_name:[
               { required: true, message: '请输入名称', trigger: 'blur' },
           ]
          },
          editDialogVisible:false, //控制编辑对话框的显示与隐藏
          editForm:{}, //编辑对话框表单的数据对象
          editFormRules:{ //编辑对话框表单的校验证规则对象
              attr_name:[
                   { required: true, message: '请输入参数名称', trigger: 'blur' },
              ]
          },
      }
  },
  created(){
      this.getCateList()
  },
  methods:{
      async getCateList(){  //请求商品分类的数据
        const {data:res}=await this.$http.get('categories')
        // console.log(res)
        if(res.meta.status!==200){
            this.$message.error('获取商品分类失败')
        }
        this.cateList=res.data
        // console.log(this.cateList);
      },
      handleChange(){  //级联选择框选中项发生变化,会触发的函数
        this.getParamsData()
      },
      handleTabClick(){ //tab标签页的点击事件的处理函数
        // console.log(this.activeName);
        this.getParamsData()
      },
      async getParamsData(){  //获取参数列表的数据
        // 选中的不是三级分类,清空级联选择框双向绑定的数组selectedCateKeys
        if(this.selectedCateKeys.length!==3){
            this.selectedCateKeys=[]
            this.manyTableData=[] 
            this.infoTableData=[]
            return
        }
        //选中的是三级分类,发生网络请求,获取对应id值的对应数据
        // console.log(this.selectedCateKeys)
        const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
        // console.log(res);
        if(res.meta.status!==200){
            this.$message.error('获取参数列表失败')
        }
        res.data.forEach(item=>{ //将attr_vals字符串转换成数组
            item.attr_vals=item.attr_vals?item.attr_vals.split(','):[],
            item.inputVisible=false, //控制input输入框与button按钮的切换
            item.inputValue=''  //input输入框的内容
        })
        console.log(res.data);
        if(this.activeName==='many'){
            this.manyTableData=res.data
        }else{
            this.infoTableData=res.data
        }
      },
      addDialogClose(){  //监听添加属性对话框的关闭,关闭后实现对表单的重置
            this.$refs.addFormRef.resetFields()
      },
      addParams(){  //添加属性对话框表单的确定按钮，实现属性的添加
        //1.1校验证
        this.$refs.addFormRef.validate(async valid=>{
            //1.1.1校验证未通过
            if(!valid) return
            //1.1.2校验证通过，发送网络请求
            const {data:res}= await this.$http.post(`categories/${this.cateId}/attributes`,{
                attr_name:this.addForm.attr_name,
                attr_sel:this.activeName
            })
            if(res.meta.status!==201){
                return this.$message.error('添加参数失败')
            }
            this.$message.success('添加参数成功')
            this.getParamsData()
            this.addDialogVisible=false
        })
      },
      async showEditDiaolog(attr_id){ //编辑按钮,根据id获取对应的数据
        //查询当前id值对应的数据
        // console.log(attr_id)
        const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
        // console.log(res);
        if(res.meta.status!==200){
            this.$message.error('获取参数列表失败')
        }
        this.editForm=res.data
        this.editDialogVisible=true
      },
      editDialogClose(){  //监听编辑对话框的关闭，实现对表单的重置
        this.$refs.editFormRef.resetFields()
      },
      editParams(){ //编辑对话框的确定按钮，实现对数据的修改
        this.$refs.editFormRef.validate(async valid=>{
            if(!valid) return
            const {data:res}= await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
            attr_name:this.editForm.attr_name,
            attr_sel:this.activeName
        })
        // console.log(res)
        if(res.meta.status!==200){
            this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getParamsData()
        this.editDialogVisible=false
      })
      },
      async deleteDiaolog(attr_id){  //删除按钮
        const resconfirm=await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        console.log(resconfirm)
        if(resconfirm!=='confirm'){
            return this.$message('取消成功')
        }
        const {data:res}=await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        // console.log(res)
        if(res.meta.status!==200){
            this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getParamsData()
      },
      async handleInputConfirm(row){  //添加标签的按钮事件,失去焦点或者按下enter都会触发该事件
        if(row.inputValue.trim().length===0){  //trim() 函数返回去掉开头和结尾空格后的字符串。
            row.inputValue=''
            row.inputVisible=false
            return
        }
        //如果没有return,则证明你输入的内容合法,则可以进行下一步的操作
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue=''
        row.inputVisible=false
        //发送网络请求,将添加的数据保存到数据库
        this.saveAttrVals(row)
      },
      handleClose(i,row){ //删除对应的参数项
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row)
      },
      //将对参数项的操作,保存到数据库
      async saveAttrVals(row){
          const {data:res}= await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
            attr_name:row.attr_name,
            attr_sel:row.attr_sel,
            attr_vals:row.attr_vals.join(',')
        })
        // console.log(res)
        if(res.meta.status!==200){
            return this.$message.error('修改参数项失败')
        }
        this.$message.success('修改参数项成功')
      },
      showInput(row){  //点击button事件,显示输入框
        row.inputVisible=true
        // 让输入框自动获取焦点
        this.$nextTick(_ => {  //$nextTick方法的作用:当页面上的元素被重新渲染之后,才会执行回调函数中的代码
          this.$refs.saveTagInput.$refs.input.focus();
        });
      }
  },
  computed:{
      //当级联选择框选中三级分类时,开启按钮,返回false,否则返回true,禁用按钮
      isBtnDisabled(){
          if(this.selectedCateKeys.length!==3){
              return true
          }else{
              return false
          }
      },
      cateId(){ //用于获取选中的三级分类的id
        if(this.selectedCateKeys.length===3){
            return this.selectedCateKeys[2]
        }
        return null
      },
      titleText(){  //用于动态的计算添加参数对话框的title
        if(this.activeName==='many'){
            return '动态参数'
        }
        return '静态属性'
      }
  }
}
</script>

<style scoped>
.cat_opt{
    margin: 15px 0;
}
.el-cascader{
    width: 300px;
}
.el-tag{
    margin: 5px;
}
.button-new-tag,.input-new-tag{
    width: 150px;
}
</style>