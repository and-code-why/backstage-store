<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 搜索框区域 -->
        <el-row :gutter="20">
            <!-- 搜索框区域 -->
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                    <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                </el-input>
            </el-col>
            <!-- 添加商品按钮区域 -->
            <el-col :span="4">
                <el-button type="primary" @click="goAddpage">添加商品</el-button>
            </el-col>
        </el-row>
        <!-- table表格区域 -->
        <el-table :data="goodslist" border stripe>
            <!-- 索引列 -->
            <el-table-column type="index" label="序号" width="60"></el-table-column>
            <!-- 具体的数据区域列 -->
            <el-table-column label="商品名称" prop="goods_name"></el-table-column>
            <el-table-column label="商品价格(元)" prop="goods_price" width="105"></el-table-column>
            <el-table-column label="商品重量" prop="goods_weight" width="105"></el-table-column>
            <el-table-column label="创建时间" prop="add_time" width="180">
                <template slot-scope="scope">
                    {{scope.row.add_time | dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="130">
                <!-- 操作按钮 -->
                <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editForm(scope.row.goods_id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="rmoveById(scope.row.goods_id)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
        </el-pagination>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog
    title="修改参数"
    :visible.sync="editFormVisible"
    width="50%"
    @close='editFormClose'
    >
    <el-form :model="editFormInfo"  ref="editFormRef" :rules="editFormRules" label-width="100px" class="demo-ruleForm">
      <!-- 编辑对话框的表单区域 -->
      <el-form-item label="商品名称" prop="goods_name">
        <el-input v-model="editFormInfo.goods_name" disabled></el-input>
      </el-form-item>
      <el-form-item label="商品价格" prop="goods_price">
        <el-input v-model="editFormInfo.goods_price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="商品重量" prop="goods_weight">
        <el-input v-model="editFormInfo.goods_weight" type="number"></el-input>
      </el-form-item>
    </el-form>
    <!-- 编辑对话框的按钮区域 -->
    <span slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible= false">取 消</el-button>
        <el-button type="primary" @click="geteditForm">确 定</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Goods',
  data () {
      return {
          queryInfo:{  //查询参数对象,也就是请求商品列表数据的参数
            query:'',
            pagenum:1,
            pagesize:10
          },
          goodslist:[], //用于保存请求过来的商品列表数据
          total:0,  //总的数据条数,可用于做分页,也就是一共有多少页
          editFormVisible:false, //控制编辑对话框的显示与隐藏
          editFormInfo:{  //编辑对话框的参数对象
            goods_id:'',
            goods_name:'',
            goods_price:'',
            goods_weight:'',
            goods_number:'',
            goods_cat:''
          },
          editFormRules:{ //编辑对话框表单的校验证规则
            goods_name:[
              { required: true, message: '请输入商品名称', trigger: 'blur' },
            ],
            goods_price:[
              { required: true, message: '请输入商品价格', trigger: 'blur' },
            ],
           goods_weight:[
              { required: true, message: '请输入商品重量', trigger: 'blur' },
            ],
          }
      }
  },
  created(){
      this.getGoodsList()
  },
  methods:{
        //获取商品列表数据
        async getGoodsList(){  
          const {data:res}= await this.$http.get('goods',{
              params:this.queryInfo
          })
          //console.log(res);
          if(res.meta.status!==200){
              return this.$message.error('获取商品列表数据失败')
          }
          //this.$message.success('获取商品列表数据成功')
          this.goodslist=res.data.goods  
          this.total=res.data.total
      },
      //分页相关
      handleSizeChange(newsize){  //监听每页有多少条数据,发生改变,触发该事件
        this.queryInfo.pagesize=newsize
        this.getGoodsList()  //刷新数据
      },
      handleCurrentChange(newnum){  //监听页码的改变,发生改变,触发该事件
        this.queryInfo.pagenum=newnum
        this.getGoodsList()
      },
      //操作按钮相关
      async rmoveById(id){  //点击删除按钮,根据id值删除对应的数据
        const resconfirm =await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // console.log(resconfirm);
        if(resconfirm !=='confirm'){
           return this.$message('取消成功')
        }
        //点击确定按钮,发送网络请求,删除对应的商品
        const {data:res} =await this.$http.delete(`goods/${id}`)
        if(res.meta.status!==200){
            this.$message.error('删除商品失败')
        }
        this.$message.success('删除商品成功')
        this.getGoodsList()
      },
      //添加商品按钮
      goAddpage(){  //点击添加商品按钮,实现跳转到添加商品的页面中
        this.$router.push('/add')
      },
      async editForm(id){  //编辑按钮,获取对应id的商品数据
        // console.log(id)
        this.editFormVisible=true
        const {data:res}=await this.$http.get('goods/'+id)
        this.editFormInfo=res.data
        // console.log(res);
      },
      editFormClose(){  //监听编辑对话框的关闭，实现对表单的重置
        this.$refs.editFormRef.resetFields()
      },
      async geteditForm(){//编辑对话框的确定按钮,实现对商品数据的修改
        const {data:res}=await this.$http.put('goods/'+this.editFormInfo.goods_id,this.editFormInfo)
        if(res.meta.status!==200){
          this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.getGoodsList()
        this.editFormVisible=false
        // console.log(res);
      }
  }
}
</script>

<style scoped>

</style>