<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <el-row>
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query">
                    <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
                </el-input>
            </el-col>
        </el-row>
        <!-- 订单列表视图区域 -->
        <el-table
        :data="orderlist"
        style="width: 100%"
        border
        stripe>
        <el-table-column type="index" label="序号" width="90"></el-table-column>
        <el-table-column  label="订单编号" prop="order_number" width="230"></el-table-column>
        <el-table-column  label="订单价格" prop="order_price"></el-table-column>
        <el-table-column  label="是否付款" prop="pay_status">
            <template slot-scope="scope">
                <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
                <el-tag type="danger" v-else>未付款</el-tag>
            </template>
        </el-table-column>
        <el-table-column  label="是否发货" prop="is_send"></el-table-column>
        <el-table-column  label="下单时间" prop="create_time">
            <template slot-scope="scope">
                {{scope.row.create_time|dateFormat}}
            </template>
        </el-table-column>
        <el-table-column  label="操作">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
        </el-table-column>
        </el-table>
        <!-- 分页视图区域 -->
         <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
    <!-- 修改地址对话框区域 -->
    <el-dialog
    title="修改地址"
    :visible.sync="addressVisible"
    width="50%"
    @close="showBoxClose"
    >
    <el-form :model="address" :rules="addressRules" ref="addressRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData" v-model="address.address1" :props="{ expandTrigger: 'hover' }">
            </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
            <el-input v-model="address.address2"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 查看物流进度对话框区域 -->
    <el-dialog
    title="物流进度"
    :visible.sync="progressVisible"
    width="50%"
    >
    <span>这是一段信息</span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'

export default {
  name: 'Orders',
  data () {
      return {
          queryInfo:{  //请求订单列表数据的参数对象
              query:'',
              pagenum:1,
              pagesize:10
          },
          total:0,  //订单列表数据的总条数
          orderlist:[],  //订单列表数据对象
          addressVisible:false,  //控制修改地址对话框的显示与隐藏
          address:{  //修改地址对话框表单的数据源对象
              address1:'',
              address2:''
          },
          addressRules:{  //修改地址对话框表单的校验证规则
              address1:[
                  { required: true, message: '请输入省市区/县', trigger: 'blur' },
              ],
              address2:[
                  { required: true, message: '请输入详细地址', trigger: 'blur' },
              ]
          },
          cityData,  //省市区/县的数据
          progressVisible:false //控制查看物流进度对话框的显示与隐藏
      }
  },
  created(){
      this.getOrdersList()
  },
  methods:{
     async getOrdersList(){  //获取订单列表信息
        const {data:res}= await this.$http.get('orders',{params:this.queryInfo})
        if(res.meta.status!==200){
            this.$message.error('获取订单列表数据失败')
        }
        // console.log(res);
        this.total=res.data.total
        this.orderlist=res.data.goods
     },
     handleSizeChange(newsize){  //当每页显示多少条数据发生改变时
         this.queryInfo.pagesize=newsize
         this.getOrdersList()
     },
     handleCurrentChange(newpage){//当页码发生改变时
         this.queryInfo.pagenum=newpage
         this.getOrdersList()
     },
     showBox(){  //修改地址按钮
        this.addressVisible=true
     },
     showBoxClose(){  //监听修改地址对话框的关闭，实现对表单的重置
        this.$refs.addressRef.resetFields()
     },
     async showProgressBox(){  //查看物流进度按钮
        this.progressVisible=true
        // const {data:res}= await this.$http.get('/kuaidi/804909574412544580')
        // console.log(res);  //请求失败，存在错误
     }
  }
}
</script>

<style scoped>
.el-cascader{
    width: 100%;
}
</style>