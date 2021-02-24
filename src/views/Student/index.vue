<template>
           <el-container>
	           <el-header>
		           <el-form :inline="true" class="form-search">
			           <el-form-item label="学生名字：" prop="stu_name" size="mini">
				           <el-input prefix-icon="el-icon-search" v-model="search.stu_name"
				                     placeholder="请输入名称"
				                     clearable @change="getList()"></el-input>
			           </el-form-item>
			           <el-form-item label="所在班级:"  prop="stu_cls_id" size="mini">
				           <el-select v-model="search.stu_cls_id" @change="getList()">
					           <el-option label="-全部-" :value="0"></el-option>
					           <el-option
						           v-for="item in classList"
						           :key="item.cls_id"
						           :label="item.cls_name"
						           :value="item.cls_id"></el-option>
				           </el-select>
			           </el-form-item>
			           <el-form-item label="学生学历：" prop="stu_qualification" size="mini">
				           <el-select v-model="search.stu_qualification" @change="getList()">
					           <el-option label="-全部-" :value=null></el-option>
					           <el-option
						           v-for="item in getGroupByKey('qualification')"
						           :key="item.dic_id"
						           :label="item.dic_name"
						           :value="item.dic_id"></el-option>
				           </el-select>
			           </el-form-item>
		           </el-form>
		           <el-form :inline="true">
			           <el-form-item size="mini" class="subNav">
				           <el-button size="mini" type="primary" icon="el-icon-plus" @click="beginAdd">新增</el-button>
				           <el-button size="mini" type="success" icon="el-icon-share" @click="batchAssign">批量分班</el-button>
				           <el-button size="mini" type="danger" icon="el-icon-download">导出学生信息</el-button>
			           </el-form-item>
		           </el-form>>
	           </el-header>
	           <el-main>
		           <template>
			           <el-table
				           :data="studentList"
			                     ref="multipleTable"
				           tooltip-effect="dark"
			                     style="width: 100%"
			                     @selection-change="handleSelectionChange"
			                     stripe border>
				           <el-table-column fixed="left" type="index"  label="#" align="center"></el-table-column>
				           <el-table-column   type="selection" fixed="left" align="center" width="55">
				           </el-table-column>
				           <el-table-column prop="stu_name" fixed="left" label="学生名字" align="center"></el-table-column>
				           <el-table-column prop="stu_cls_id" label="班级"  align="center">
					           <template  slot-scope="{row}">
						           <span v-if="row.stu_cls_id "   v-text="classList.length ? classList.find(item => item.cls_id === row.stu_cls_id).cls_name : ''"></span>
						           <span v-else>暂无班级</span>
					           </template>
				           </el-table-column>
				           <el-table-column prop="stu_avatar" label="存档照片"   align="center">
					           <template slot-scope="{row}">
					           <el-popover
						           placement="right"
						           width="180"
						           trigger="click">
					             <div class="popover-avatar">
						           <span v-text="'姓名：'+row.stu_name"></span>
						           <el-avatar shape="square" :size="140"  :src="row.stu_avatar"></el-avatar>
						             <span v-if="!row.stu_avatar">暂无头像</span>
					             </div>
						           <span slot="reference">预览</span>
					           </el-popover>
					           </template>
				           </el-table-column>
				           <el-table-column prop="stu_sex" label="性别"   align="center">
					           <template  slot-scope="{row}">
						           <span  v-text="row.stu_sex ? '男' : '女'"></span>
					           </template>
				           </el-table-column>
				           <el-table-column prop="stu_phone" label="联系电话"   align="center"></el-table-column>
				           <el-table-column prop="stu_phone2" label="联系电话(备用)"   align="center"></el-table-column>
				           <el-table-column prop="stu_born" label="出生日期"   align="center"></el-table-column>
				           <el-table-column prop="stu_qualification" label="学历"   align="center">
					           <template  slot-scope="{row}">
					           <span  v-text="getGroupByKey('qualification') ? getGroupByKey('qualification').find(item=>item.dic_id===row.stu_qualification).dic_name : ''"></span>
					           </template>
				           </el-table-column>
				           <el-table-column prop="stu_school" label="毕业学校"   align="center"></el-table-column>
				           <el-table-column prop="stu_major" label="院校专业"   align="center"></el-table-column>
				           <el-table-column prop="stu_address" label="家庭住址"   align="center"></el-table-column>
				           <el-table-column  label="备注">
					           <template  slot-scope="{row}">
						           <span v-if="row.stu_remark  !== ''"  v-text="row.stu_remark"></span>
						           <span v-else>暂无相关备注</span>
					           </template>
				           </el-table-column>
				           <el-table-column fixed="right" label="操作" width="360px">
					           <template slot-scope="{row}">
						           <el-button  size="mini" type="success" class="el-icon-share" @click="beginAssign(row)">分班</el-button>
						           <el-button size="mini" type="danger"  class="el-icon-picture-outline" @click="beginAvatar(row)">照片存档</el-button>
						           <el-button size="mini" type="primary"  class="el-icon-edit"  @click="beginUpdate(row)">编辑</el-button>
						           <el-button size="mini" type="warning"  class="el-icon-delete" @click="beginDel(row)">删除</el-button>
					           </template>
				           </el-table-column>
			           </el-table>
		           </template>
	           </el-main>
	           <el-footer>
		           <el-pagination
			           background
			           :total="pagination.total"
			           @size-change="getList()"
			           @current-change="getList(false)"
			           :page-sizes="[5, 8, 10, 12, 15]"
			           :page-size.sync='pagination.pageSize'
			           :current-page.sync="pagination.currentPage"
			           layout="prev,pager,next,jumper,->,total,sizes">
		           </el-pagination>
	           </el-footer>
	           <el-dialog :modal="false" :show-close="false" :visible="edit.isEdit"  width="700px"
	                      :title="edit.mode? '学生维护-新增' : '学生维护-修改'" >
		           <el-form ref="form" :model="edit.model" label-width="140px"  :rules="rules" status-icon>
			           <el-form-item label="*学生姓名：" prop="stu_name">
				           <el-input placeholder="请输入学生姓名" v-model="edit.model.stu_name"></el-input>
			           </el-form-item>
			           <el-form-item label="*性别："  prop="stu_sex">
				           <template>
				           <el-radio v-model="edit.model.stu_sex" :label="1">男</el-radio>
				           <el-radio v-model="edit.model.stu_sex" :label="0">女</el-radio>
				           </template>
			           </el-form-item>
			           <el-form-item label="*联系电话："  prop="stu_phone">
				           <el-input placeholder="请输入手机号码" v-model="edit.model.stu_phone"></el-input>
			           </el-form-item>
			           <el-form-item label="*备用电话：" prop="stu_phone2">
				           <el-input placeholder="请输入备用电话" v-model="edit.model.stu_phone2"></el-input>
			           </el-form-item>
			           <el-form-item label="*出生日期："  prop="stu_born">
				           <template>
					           <div class="block">
						           <el-date-picker
							           v-model="edit.model.stu_born"
							           type="date"
							           value-format="yyyy-MM-dd"
							           placeholder="选择日期">
						           </el-date-picker>
					           </div>
				           </template>
			           </el-form-item>
			           <el-form-item label="学历："  prop="stu_qualification">
				           <el-select v-model="edit.model.stu_qualification" >
					           <el-option
						           v-for="item in getGroupByKey('qualification')"
						           :key="item.dic_id"
						           :label="item.dic_name"
						           :value="item.dic_id"></el-option>
				           </el-select>
			           </el-form-item>
			           <el-form-item label="*毕业院校：" prop="stu_school">
				           <el-input  placeholder="请输入毕业院校（选填）" v-model="edit.model.stu_school"></el-input>
			           </el-form-item>
			           <el-form-item label="*在校学习专业：" prop="stu_major">
			           <el-input  placeholder="请输入专业名（选填）" v-model="edit.model.stu_major"></el-input>
		                   </el-form-item>
			           <el-form-item label="*家庭住址：" prop="stu_address">
				           <el-input  placeholder="请输入家庭住址" v-model="edit.model.stu_address"></el-input>
			           </el-form-item>
			           <el-form-item label="*学生备注：" prop="stu_remark">
				           <el-input type="textarea"  placeholder="请输入备注" v-model="edit.model.stu_remark"></el-input>
			           </el-form-item>
		           </el-form>
		           <span slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit= false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</span>
	           </el-dialog>
	           <el-dialog title="学生分班" :modal="false" :show-close="false" :visible="assignClass.isAssign"  width="700px">
		           <el-form>
			           <el-form-item>
				           <template>
					           <span>班级选择：</span>
				           </template>
				           <el-select v-model="assignClass.model.stu_cls_id" >
					           <el-option
						           v-for="item in classList"
						           :key="item.cls_id"
						           :label="item.cls_name"
						           :value="item.cls_id"></el-option>
				           </el-select>
			           </el-form-item>
		           </el-form>
		           <span slot="footer" class="dialog-footer">
				<el-button @click="assignClass.isAssign = false">取 消</el-button>
				<el-button type="primary" @click="assignSave">确 定</el-button>
			</span>
	           </el-dialog>
	           <el-dialog title="更新头像" :modal="false" :show-close="false" :visible="stuAvatar.isAvatar">
		           <div class="avatar-box">
		           <template>
			           <div class="now-avatar" v-if="stuAvatar.nowAvatar">
				           <el-image
					           style="width: 146px; height: 146px"
					           :src="stuAvatar.nowAvatar"></el-image>
				           <h3 style="line-height: 24px">现有头像</h3>
			           </div>
		           </template>
                       <el-upload ref="upload" accept=".jpg,.png" action="/student/avatarupload" name="avatar" :headers="headers"
                                               :beforeUpload="beforeAvatar" :on-success="avatarUploadSuccess" 	list-type="picture-card"  :on-remove="avatarRemove">
			                       <i class="el-icon-plus"></i>
			                       <p slot="tip">只能上传jpg或png文件！</p>
	                                       <p slot="tip"> 且大小不能超过2M！</p>
	              </el-upload>
		           </div>
		           <span slot="footer" class="dialog-footer">
				<el-button @click="stuAvatar.isAvatar = false">取 消</el-button>
				<el-button type="primary" @click="sureAvatar" :disabled="stuAvatar.model.stu_avatar_new === ''">存 档</el-button>
			   </span>
	           </el-dialog>
           </el-container>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from "vuex";
        import ElImage from "../../../node_modules/element-ui/packages/image/src/main.vue";
        import ElMain from "../../../node_modules/element-ui/packages/main/src/main.vue";
        import ElContainer from "../../../node_modules/element-ui/packages/container/src/main.vue";
	let {mapGetters}  = createNamespacedHelpers("dictionary")
        export default {
                components: {
                        ElContainer,
                        ElMain,
                        ElImage},
                name: "Student",
                data(){
                        return {
	                        search: {stu_name: null, stu_cls_id: 0, stu_qualification: null},
                                pagination: {
                                        pageSize: 5,
                                        currentPage: 1,
                                        total: 0,
                             },
	                        edit: {
                                   isEdit: false,
		                   mode: true,
		                   model: {stu_id: 0,stu_name: null, stu_avatar: null, stu_cls_id: null, stu_sex: 0, stu_phone: "", stu_phone2: "",
                                           stu_born: "", stu_qualification: "", stu_school: "", stu_major: "", stu_address: "", stu_remark: "" }
	                        },
                                assignClass: {
	                             isAssign: false,
                                     model:{stu_id: null, stu_ids: [], stu_cls_id: null},
                                },
	                        stuAvatar: {
	                                isAvatar: false,
		                        nowAvatar: null,
	                                model: { stu_id: 0, stu_avatar_old: null, stu_avatar_new: null}
	                        },
                                rules: {
                                        stu_name:[{
                                                validator: (rule, value, callback) =>{
                                                        //ES6中的解构赋值
                                                        if(value === null || value === ""){
                                                                callback(new Error('*姓名不能为空'))
                                                        }
                                                        else if(value.length < 2 || value.length > 20){
                                                                callback(new Error('*学生名长度2-20'))
                                                        }
                                                        else{
                                                                callback();
                                                        }
                                                },
                                                trigger: "blur"
                                        }],
                                        stu_phone:[{
                                                validator: async (rule, value, callback) =>{
                                                        //ES6中的解构赋值
                                                        if(value.length === 0){
                                                                callback(new Error('*手机号码不能为空'))
                                                        }
                                                        else if(await this.$http({url: "/student/valid_phone", method: "post", data:{stu_phone : this.edit.model.stu_phone }})){
                                                                callback(new Error('*手机号码格式不对'))
                                                        }
                                                        else if(!/^1[3|4|5|7|8][0-9]{9}$$/.test(value)){
                                                                callback(new Error('*手机号码格式不对'))
                                                        }
                                                        else{
                                                                callback();
                                                        }
                                                },
                                                trigger: "blur"
                                        }],
                                        stu_qualification:[{ required: true, message: '请选择学历', trigger: 'change'}]
                                },
	                        classList: [],
	                        studentList: [],
                                headers: {"Authorization":sessionStorage.getItem("token")}
                        }
                },
	        computed: {
		        ...mapGetters(['getGroupByKey']),
	        },
	        methods: {
                        getList(fromPage1 = true) {
                                if(fromPage1) this.pagination.currentPage = 1;
                                this.$http({
                                        url: "/student/list",
                                        method: "post",
                                        data: {
                                                ...this.search,
                                                begin: this.pagination.pageSize * (this.pagination.currentPage - 1),
                                                pageSize: this.pagination.pageSize
                                        }
                                })
                                        .then((data) => {
                                                this.studentList = data.list;
                                                this.pagination.total = data.total;
                                        })
                        },
		        beginDel(node){

		        },
		        beginAdd(){
                                this.edit.mode = true;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.model = {stu_id: 0,stu_name: null, stu_avatar: null, stu_cls_id: null, stu_sex: 0, stu_phone: "", stu_phone2: "",
                                        stu_born: "", stu_qualification: "", stu_school: "", stu_major: "", stu_address: "", stu_remark: "" }
                                this.edit.isEdit = true;
		        },
		        beginUpdate(node){
                                this.edit.mode = false;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.model = node;
                                this.edit.isEdit = true;
		        },
	     async  save(){
                                this.$refs.form.validate(async valid =>{
                                        if(!valid) return;
                                        if(this.edit.mode){
                                                let  id = await this.$http({
	                                                url: "/student/add",
	                                                method: "post",
	                                                data: this.edit.model
                                                });
	                                        this.edit.model.stu_id = id;
                                                this.studentList.push(Object.assign({}, this.edit.model));
                                                this.pagination.total = this.pagination.total + 1;
                                                this.$message({
                                                        message: `"${this.edit.model.stu_name}" 学生，新增成功!`,
                                                        type: "success"
                                                });
                                        }else{
                                                await this.$http({
                                                        url: "/student/update",
                                                        method: "post",
                                                        data: this.edit.model
                                                });
                                                let i = this.studentList.findIndex(item => item.stu_id === this.edit.model.stu_id);
                                                this.studentList.splice(i,1,Object.assign({},this.edit.model));
                                                this.$message({
                                                        message: `"${this.edit.model.stu_name}" 学生，修改成功！`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;
                                })
		        },
		        beginAssign(node){
		                this.assignClass.model.stu_id = node.stu_id;
                                this.assignClass.isAssign = true
		        },
                        handleSelectionChange(val){
                                this.assignClass.model = {stu_id: null, stu_ids: [], stu_cls_id: null};
                             val.forEach(item => {
                                   this.assignClass.model.stu_ids.push(item.stu_id)
                           })
                        },
		        batchAssign(){
                                this.assignClass.model.stu_id= null;
                                if(  this.assignClass.model.stu_ids.length === 0){
                                        this.$message({
                                                message: "尚未选择学生",
                                                type: "warning"
                                        });
                                        return ;
                                }
			        this.assignClass.isAssign = true;
		        },
	     async assignSave(){
                          await  this.$http({
	                                url: "/student/assignclass",
	                                method: "post",
	                                data: this.assignClass.model
                                })
	                          this.studentList.forEach(item => {
		                          if(item.stu_id===this.assignClass.model.stu_id){
		                                  item.stu_cls_id = this.assignClass.model.stu_cls_id
		                          }
                                  });
                          for(let i=0; i< this.assignClass.model.stu_ids.length; i++){
                                  for(let j=0; j<this.studentList.length; j++){
                                          if(this.studentList[j].stu_id ===this.assignClass.model.stu_ids[i]){
                                                  this.studentList[j].stu_cls_id =  this.assignClass.model.stu_cls_id;
                                          }
                                  }
                          }
                               this.$message({
                                       message: `分班成功!`,
                                       type: "success"
                               });
                               this.assignClass.isAssign = false;
		        },
                        beginAvatar(node){
	                     this.stuAvatar.model= { stu_id: 0, stu_avatar_old: null, stu_avatar_new: ""};
                             this.stuAvatar.model.stu_id = node.stu_id;
                             this.stuAvatar.nowAvatar = this.studentList.find(i => i.stu_id === node.stu_id).stu_avatar;
	                     this.stuAvatar.isAvatar = true;
                        },
                        beforeAvatar(file){
                                const isJPG = file.type === 'image/jpeg';
                                const isPNG = file.type === 'image/png';
                                const isLt2M = file.size / 1024 /1024 < 2;
                                if(!((!isJPG) && (!isPNG))){
                                }else{
                                        this.$message.error('上传头像图片只能是JPG或PNG格式！')
                                }
                                if(!isLt2M) {
                                        this.$message.error('上传头像图片大小不能超过2MB!');
                                }
                                return (isJPG || isPNG) && isLt2M;
                        },
                        avatarUploadSuccess({status, data, message}, file, fileList){
                                switch(status){
	                                case 200:
	                                        this.stuAvatar.model.stu_avatar_new = data;
	                                        if(fileList.length > 1) fileList.shift();
	                                        break;
	                                case 401:
	                                case 404:
	                                case 199:
	                                case 500:
	                                        this.$message.error(message)
                                }
                        },
                        avatarRemove(){
	                        this.stuAvatar.model.stu_avatar_new = null
                        },
	     async sureAvatar(){
                           let newAvatar= await this.$http({
	                            url: "/student/avatarupdate",
	                            method: "post",
	                            data: this.stuAvatar.model
                            });
                            this.studentList.find(item => item.stu_id === this.stuAvatar.model.stu_id).stu_avatar =  newAvatar;
                            this.$message.success("头像上传更新成功！");
                            this.$refs.upload.clearFiles();
                            this.stuAvatar.isAvatar = false;
		        }
        },
	      async created() {
                    this.classList = await this.$http({url: "/class/all"});
                    this.getList()
	        }
        }
</script>

<style scoped>
	.el-container{
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		width: 100%;
	}
	.el-footer{
		display: flex;
		align-items: center;
	}
	.el-pagination{
		flex-grow: 1;
	}
	.el-header{
		padding-top: 20px;
	}
	.el-main{
		margin-top: 50px;
		padding-top: 0 ;
	}
	.popover-avatar{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.avatar-box{
		display: flex;
		justify-content: space-around;
	}
	.now-avatar{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.subNav{
		width: 100%;
		display: flex;
		justify-content: space-between;
	}
	.form-search{
		display: flex;
		justify-content: center;
	}
</style>