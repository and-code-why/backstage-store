<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
         <!-- 消息提示区域 -->
        <el-alert title="消息提示的文案" type="info" center show-icon :closable='false'></el-alert>
        <!-- 步骤条视图区域 -->
        <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!-- table标签区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
            <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <!-- 级联选择器 -->
                        <el-cascader
                        v-model="addForm.goods_cat"
                        :options="catelist"
                        :props="cateProps"
                        @change="handleChange">
                        </el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <!-- 渲染item -->
                    <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
                        <!-- 渲染复选框 -->
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <el-upload
                        :action="uploadURL"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        list-type="picture"
                        :headers="headerObj"
                        :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <!-- 富文本编辑器视图区域 -->
                    <quill-editor v-model="addForm.goods_introduce">
                    </quill-editor>
                    <!-- 商品内容的添加商品按钮 -->
                    <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>
    <!-- 图片预览对话框区域 -->
    <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="50%"
    >
        <!-- 图片预览图片区域 -->
        <img :src="previewPath" alt="" class="preview_img">
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Add',
  data () {
      return {
          activeIndex:'0', //控制步骤条的激活项,以及tabs标签的切换
          addForm:{//添加商品表单的数据对象
           goods_name:'',
           goods_price:'',
           goods_weight:'',
           goods_number:'',
           goods_cat:[], //商品所属的分类数组
           pics:[], //图片的数组
           goods_introduce:'',  //商品内容的介绍
           attr:[]  //商品的参数数组
          }, 
          addFormRules:{  //表单的校验证规则对象
            goods_name:[
                { required: true, message: '请输入商品名称', trigger: 'blur' }
            ],
            goods_price:[
                { required: true, message: '请输入商品价格', trigger: 'blur' }
            ],
            goods_weight:[
                { required: true, message: '请输入商品重量', trigger: 'blur' }
            ],
            goods_number:[
                { required: true, message: '请输入商品数量', trigger: 'blur' }
            ],
            goods_cat:[
                { required: true, message: '请选择商品分类', trigger: 'blur' }
            ]
          },
          catelist:[], //保存获取到的商品分类信息
          cateProps:{  //级联选择器的配置项
            expandTrigger:'hover',
            label:'cat_name',  //看的是什么属性
            value:'cat_id',  //选中的是什么属性
            children:'children' //父子之间的嵌套
          },
          manyTabData:[], //保存动态参数的数据，也就是商品参数的数据
          onlyTabData:[], //保存静态属性的数据，也就是商品属性的数据
          uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload', //指定图片上传的后台API地址
          headerObj:{  //图片上传的请求头部对象,必须加上这个，否则图片上传事件失败
            Authorization:window.sessionStorage.getItem('token')
          },
          previewPath:'', //保存预览图片的URL地址
          previewVisible:false,  //控制图片预览对话框的显示与隐藏
      }
  },
  created(){
      this.getCateList()
  },
  methods: {
      async getCateList(){  //获取商品分类的所有消息
        const {data:res}= await this.$http.get('categories')
        if(res.meta.status!==200){
            this.$message.error('获取商品分类信息失败')
        }
        this.catelist=res.data
        // console.log(this.catelist)
      },
      handleChange(){  //级联选择器发送变化，触发该事件
        // console.log(this.addForm.goods_cat);
        if(this.addForm.goods_cat.length!==3){  //只能选择三级分类，否则清空数组
            this.addForm.goods_cat=[]
        }
      },
      beforeTabLeave(activeName, oldActiveName){  //tabs标签发生切换时，触发该事件
        // console.log(`即将进入的标签页名称${activeName}`)
        // console.log(`即将离开的标签页名称${oldActiveName}`)
        //条件：当在基本信息页面时，必须选择商品分类，才可实现tabs标签的切换,否则禁止tabs标签的切换
        if(oldActiveName==='0'&&this.addForm.goods_cat.length!==3){
            this.$message.error('请选择商品分类')
            return false  //禁止tabs标签发生切换
        }
      },
      async tabClicked(){  //tab 被选中时触发
        // console.log(this.activeIndex);
        //当activeIndex='1'时,发生网络请求,把商品参数信息请求过来
        if(this.activeIndex==='1'){
                const {data:res}= await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:'many'}
            })
            // console.log(res);
            if(res.meta.status!==200){
                return this.$message.error('获取商品参数失败')
            }
            res.data.forEach(item=>{  //将attr_vals从字符串转换成数组
                item.attr_vals=item.attr_vals.length===0?[]:item.attr_vals.split(',')
            })
            this.manyTabData=res.data
            // console.log(this.manyTabData);
        }
        //当activeIndex='2'时,发生网络请求,把商品属性信息请求过来
        if(this.activeIndex==='2'){
            const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:'only'}
            })
            if(res.meta.status!==200){
                this.$message.error('获取商品属性失败')
            }
            this.onlyTabData=res.data
            // console.log(this.onlyTabData);
        }
      },
      handlePreview(file){  //图片预览效果事件，file图片的信息
        // console.log(file);
        this.previewPath=file.response.data.url
        // console.log(this.previewPath);
        this.previewVisible=true
      },
      handleRemove(file){  //移除图片效果事件 ，file是移除图片的信息
        // console.log(file);
        //1.拿到删除图片的临时路径
        const filePath=file.response.data.tmp_path
        // console.log(filePath);
        //2.根据pics数组拿到这个图片对应的索引值，判断这张图片的临时路径是否与拿到的删除图片的临时路径，相等则删除图片
        const i= this.addForm.pics.findIndex(x=>
            x.pic===filePath
        )
        //3.调用splice方法，将删除图片的信息从pics数组中移除
        this.addForm.pics.splice(i,1)
        // console.log(this.addForm)
      },
      handleSuccess(response){  //监听图片上传成功时的事件
        // console.log(response);
        //拼接得到一个图片信息对象
        const picInfo={pic:response.data.tmp_path}    //tmp_path储存图片的临时路径
        //将图片信息push到pics数组中
        this.addForm.pics.push(picInfo)
        // console.log(this.addForm);
      },
      add(){  //商品内容的添加商品按钮
        // console.log(this.addForm);
        // 实现添加商品按钮的校验证，也就是对基本信息的表单进行校验证
        this.$refs.addFormRef.validate(async valid=>{
            //未通过校验证
            if(!valid){
                this.$message.error('请输入必要的表单项')
                this.activeIndex='0'  //返回基本信息页
                return      
            }
            //通过校验证，执行添加商品的业务逻辑
            // 1.将goods_cat从数组转换成字符串
            this.addForm.goods_cat=this.addForm.goods_cat.join(',')
            //处理attr 
            // 2.1处理动态参数
            this.manyTabData.forEach(item=>{
                const newInfo={attr_id:item.attr_id,attr_value:itme.attr_vals.join(' ')}
                this.addForm.attr.push(newInfo)
            })
            // 2.2处理静态属性
            this.onlyTabData.forEach(item=>{
                const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals}
                this.addForm.attr.push(newInfo)
            })
            // console.log(this.addForm);
            // 发生添加商品的网络请求
            const {data:res}=await this.$http.post('goods',this.addForm)
            if(res.meta.status!==201){
                this.$message.error('添加商品失败')
            }
            this.$message.success('添加商品成功')
            this.$router.push('/goods')
            })
      }
  },
  computed:{
      cateId(){  //获取三级分类的id
          if(this.addForm.goods_cat.length===3){
              return this.addForm.goods_cat[2]
          }
          return null
      }
  }
}
</script>

<style scoped>
.el-checkbox{
    margin: 0 10px 0px 0px !important;
}
.preview_img{
    width: 100%;
}
.addBtn{
    margin-top: 15px;
}
</style>