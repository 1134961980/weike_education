<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="班级名称：" prop="cls_name" size="mini">
					<el-input prefix-icon="el-icon-search" v-model="search.cls_name"
					          placeholder="请输入名称"
					          clearable @change="getList()"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：" prop="cls_dic_id_major" size="mini">
					<el-select v-model="search.cls_dic_id_major" @change="getList()">
						<el-option label="-全部-" :value="0"></el-option>
						<el-option
							v-for="item in getGroupByKey('class_major')"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级状态:"  prop="cls_end" size="mini">
					<el-select v-model="search.cls_status" @change="getList()">
						<el-option label="-全部-" :value="0"></el-option>
						<el-option label="开课中" :value="1"></el-option>
						<el-option label="未开课" :value="2"></el-option>
						<el-option label="结课" :value="3"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item size="mini">
					<el-button type="success" icon="el-icon-plus"  @click="beginAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<template>
				<el-table :data="classList"
				          style="width: 100%"
				          stripe border>
					<el-table-column type="index"  label="#" align="center"></el-table-column>
					<el-table-column prop="cls_name" label="班级名称"></el-table-column>
					<el-table-column prop="cls_dic_id_major" label="班级专业"  align="center">
						<template  slot-scope="{row}">
							<span  v-text="getGroupByKey('class_major') ? getGroupByKey('class_major').find(item=>item.dic_id===row.cls_dic_id_major).dic_name : ''"></span>
						</template>
					</el-table-column>
					<el-table-column prop="cls_stf_id_teacher" label="班主任"   align="center">
						<template  slot-scope="{row}">
							<span  v-text="staffCoordinator.length ? staffCoordinator.find(item=>item.stf_id===row.cls_stf_id_teacher).stf_name : ''"></span>
						</template>
					</el-table-column>
					<el-table-column prop="cls_stf_id_admin" label="教务老师"   align="center">
						<template  slot-scope="{row}">
							<span  v-text="staffAdmin.length ? staffAdmin.find(item=>item.stf_id===row.cls_stf_id_admin).stf_name : ''"></span>
						</template>
					</el-table-column>
					<el-table-column prop="cls_stf_id_job" label="教学老师"   align="center">
						<template  slot-scope="{row}">
							<span  v-text="staffSinology.length ? staffSinology.find(item=>item.stf_id===row.cls_stf_id_job).stf_name : ''"></span>
						</template>
					</el-table-column>
					<el-table-column prop="cls_clsr_id" label="教室"   align="center">
						<template  slot-scope="{row}">
							<span v-if="row.cls_clsr_id"  v-text="classrooms.length ? classrooms.find(item=>item.clsr_id===row.cls_clsr_id).clsr_name : ''"></span>
							<span v-else>暂无教室</span>
						</template>
					</el-table-column>
					<el-table-column prop="cls_begin" label="开课时间" align="center"></el-table-column>
					<el-table-column prop="cls_end" label="结课时间" align="center"></el-table-column>
					<el-table-column label="班级状态"   align="center">
						<template  slot-scope="{row}">
							<span  v-if="row.cls_begin !== null  &&  row.cls_end === null ">开课中</span>
							<span  v-else-if="row.cls_begin === null &&  row.cls_end === null ">未开课</span>
							<span  v-else-if="row.cls_begin !== null &&  row.cls_end !== null ">结课</span>
						</template>
					</el-table-column>
					<el-table-column  label="备注">
						<template  slot-scope="{row}">
							<span v-if="row.cls_remark  !== ''"  v-text="row.cls_remark"></span>
							<span v-else>暂无相关备注</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="170px">
						<template slot-scope="{ row }">
							<el-button  size="mini" type="primary" class="el-icon-edit" @click="beginUpdate(row)">编辑</el-button>
							<el-button v-if="row.cls_begin === null  &&  row.cls_end === null"  size="mini" type="info"  @click="starClass(row)">开课</el-button>
							<el-button v-if="row.cls_begin !== null  &&  row.cls_end === null " size="mini" type="warning"  @click="endClass(row)">结课</el-button>
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
				:page-sizes="[6, 8, 10, 12, 15]"
				:page-size.sync='pagination.pageSize'
				:current-page.sync="pagination.currentPage"
				layout="prev,pager,next,jumper,->,total,sizes">
			</el-pagination>
		</el-footer>
		<el-dialog :modal="false" :show-close="false" :visible="edit.isEdit"  width="700px"
		           :title="edit.mode? '班级维护 - 新增' : '班级维护 - 修改'" >
			<el-form ref="form" :model="edit.model" label-width="140px"  :rules="rules" status-icon @validate="formValidateHandler">
				<el-form-item label="*班级名称：" prop="cls_name">
					<el-input placeholder="请输入班级名" v-model="edit.model.cls_name"></el-input>
				</el-form-item>
				<el-form-item label="班级专业"  prop="cls_dic_id_major">
					<el-select v-model="edit.model.cls_dic_id_major" >
						<el-option
							v-for="item in getGroupByKey('class_major')"
							:key="item.dic_id"
							:label="item.dic_name"
							:value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班主任"  prop="cls_stf_id_teacher">
					<el-select v-model="edit.model.cls_stf_id_teacher" >
						<el-option
							v-for="item in staffCoordinator"
							:key="item.stf_id"
							:disabled="!item.stf_invalid"
							:label="item.stf_name"
							:value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师"  prop="cls_stf_id_admin">
					<el-select v-model="edit.model.cls_stf_id_admin" >
						<el-option
							v-for="item in staffAdmin"
							:key="item.stf_id"
							:disabled="!item.stf_invalid"
							:label="item.stf_name"
							:value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师"  prop="cls_stf_id_job">
					<el-select v-model="edit.model.cls_stf_id_job" >
						<el-option
							v-for="item in staffSinology"
							:key="item.stf_id"
							:disabled="!item.stf_invalid"
							:label="item.stf_name"
							:value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="*班级备注" prop="stf_remark">
					<el-input type="textarea"  placeholder="请输入备注" v-model="edit.model.cls_remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit= false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="教室选择" :modal="false" :show-close="false" :visible="startClass.isStartClass"  width="700px">
			<el-form  ref="form1"  :rules="rules1" :model="startClass.model">
				<el-form-item prop="cls_clsr_id">
					<template>
						<span>教室选择：</span>
					</template>
					<el-select v-model="startClass.model.cls_clsr_id" >
						<el-option
							v-for="item in classrooms"
							:key="item.clsr_id"
							:label="item.clsr_name"
							:disabled="item.clsr_occupy  === 1"
							:value="item.clsr_id"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="startClass.isStartClass= false">取 消</el-button>
				<el-button type="primary" @click="sureStart">确 定</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
import {createNamespacedHelpers} from "vuex";
import ElDrawer from "../../../node_modules/element-ui/packages/drawer/src/main.vue";
import ElDialog from "../../../node_modules/element-ui/packages/dialog/src/component.vue";
import ElForm from "../../../node_modules/element-ui/packages/form/src/form.vue";
import ElFormItem from "../../../node_modules/element-ui/packages/form/src/form-item.vue";
let  {mapGetters} = createNamespacedHelpers('dictionary');
let  {mapState,mapActions,mapMutations} = createNamespacedHelpers('classroom');
        export default {
                components: {
                        ElFormItem,
                        ElForm,
                        ElDialog,
                        ElDrawer},
                name: "Class",
                data(){
                        return {
                                search: { cls_name: "", cls_dic_id_major: 0,  cls_status: 0},
                                pagination: {
                                        pageSize: 6,
                                        currentPage: 1,
                                        total: 0,
                                },
	                        startClass: {
                                        isStartClass: false,
		                        model: {cls_name: "",cls_id: null, cls_clsr_id: null}
	                        },
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        model:{ cls_id:  null, cls_cslr_id: 0, cls_name: "", cls_dic_id_major: null,
	                                        cls_stf_id_teacher: null, cls_stf_id_admin: null, cls_stf_id_job: null, cls_begin: null, cls_end: null, cls_remark: ""},
                                },
	                        classList: [],
	                        staffCoordinator: [],
                                staffAdmin: [],
                                staffSinology: [],
                                userNameValidateResult:  undefined,
	                        rules: {
                                        cls_name: [{
                                                validator: async (rule, value, callback) =>{
                                                        if(value.length === 0){
                                                                callback(new Error('*班级名不能为空'))
                                                        }
                                                        else if(value.length < 2 || value.length > 20){
                                                                callback(new Error('*班级名长度2-20'))
                                                        }
                                                        else if(await  this.$http({url: "/class/valid_name", method: "post", data: {cls_name: this.edit.model.cls_name}})){
                                                                callback(new Error("*班级名已存在！"))
                                                        }
                                                        else{
                                                                callback();
                                                        }
                                                },
                                                trigger: "blur"
                                        }],
                                        cls_dic_id_major: [{
                                                 required: true, message: '请选择班级专业', trigger: 'change'
                                        }],
                                        cls_stf_id_teacher: [{
                                                required: true, message: '请选择班主任', trigger: 'change'
                                        }],
                                        cls_stf_id_admin: [{required: true, message: '请选择教务老师', trigger: 'change'}],
                                        cls_stf_id_job: [{required: true, message: '请选择教学老师', trigger: 'change'}]
	                        },
                                rules1: {
                                        cls_clsr_id:  [{ required: true, message: '请选择教室', trigger: 'change'}]
	                        }
                        }
                },
	        computed: {
		        ...mapGetters(["getGroupByKey"]),
                        ...mapState(["classrooms"]),
	        },
	        methods: {
		        ...mapMutations(["useClsr"]),
		        ...mapActions(["init"]),
                        getList(fromPage1 = true) {
                                if(fromPage1) this.pagination.currentPage = 1;
                                this.$http({
                                        url: "/class/list",
                                        method: "post",
                                        data: {
                                                ...this.search,
                                                begin: this.pagination.pageSize * (this.pagination.currentPage - 1),
                                                pageSize: this.pagination.pageSize
                                        }
                                })
                                        .then((data) => {
                                                this.classList = data.list;
                                                this.pagination.total = data.total;
                                        })
                        },
                      starClass(node) {
                              this.$confirm('是否开班?', '提示', {
                                      confirmButtonText: '确定',
                                      cancelButtonText: '取消',
                                      type: 'warning'
                              }).then( () =>{
                                  this.$refs.form1 && this.$refs.form1.resetFields();//重置表单
                                 this.startClass.model.cls_id = node.cls_id;
                                 this.startClass.model.cls_name = node.cls_name;
                                 this.startClass.model.cls_clsr_id = null;
                                 this.startClass.isStartClass = true
                              })
                        },
		       sureStart(){
                                this.$refs.form1.validate(async valid =>{
                                        if(!valid) return;
                                        let timer = await  this.$http({
                                                url: "/class/begin",
                                                method: "post",
                                                data: {
                                                        cls_id: this.startClass.model.cls_id,
                                                        cls_clsr_id: this.startClass.model.cls_clsr_id
                                                }
                                        });
                                        this.classList.forEach(item =>{
                                                if(item.cls_id === this.startClass.model.cls_id){
                                                        item.cls_begin = timer
                                                        item.cls_clsr_id = this.startClass.model.cls_clsr_id
                                                }
                                        });
                                        this.startClass.isStartClass = false;
                                        this.useClsr(this.startClass.model.cls_clsr_id)
                                        this.$message({
                                                message: `"${this.startClass.model.cls_name}" 开课成功!`,
                                                type: "success"
                                        });
                                })
		        },
		       endClass(node) {
                               this.$confirm('是否结课?', '提示', {
                                       confirmButtonText: '确定',
                                       cancelButtonText: '取消',
                                       type: 'warning'
                               }).then(async () =>{
                                       let timer = await  this.$http({
                                               url: "/class/end",
                                               method: "post",
                                               data: {
                                                       cls_id : node.cls_id
                                               }
                                       });
                                       this.classList.forEach(item =>{
                                               if(item.cls_id === node.cls_id){
                                                       item.cls_end = timer
                                               }
                                       });
                                       this.$message({
                                               message: `"${node.cls_name}" 结课成功!`,
                                               type: "success"
                                       });
                               })
		        },
		        beginAdd(){
                                this.initStaff();
                                this.edit.mode = true;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.model={ cls_id:  null, cls_cslr_id: null, cls_name: "", cls_dic_id_major: null,
                                        cls_dic_id_teacher: null, cls_stf_id_admin: null, cls_stf_id_job: null, cls_begin: null, cls_end: null, cls_remark: ""};
                                this.edit.isEdit =  true;
		        },
                        beginUpdate(node){
                                this.initStaff();
                                this.edit.mode = false;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.model.cls_id = node.cls_id;
                                this.edit.model.cls_name = node.cls_name;
                                this.edit.model.cls_dic_id_major = node.cls_dic_id_major;
                                this.edit.model.cls_stf_id_teacher = node.cls_stf_id_teacher;
                                this.edit.model.cls_stf_id_admin = node.cls_stf_id_admin;
                                this.edit.model.cls_stf_id_job = node.cls_stf_id_job;
                                this.edit.model.cls_remark = node.cls_remark;
                                this.edit.isEdit =  true;
		        },
                        formValidateHandler(prop, valid, message){
                                if(prop === "user_name") this.userNameValidResult = valid;
                        },
		        async save(){
                                if(this.edit.mode){
                                        if(this.userNameValidateResult === false) return;
                                        if(typeof  this.userNameValidateResult === "undefined"){
                                                await  new Promise(resolve => this.$refs.form.validateField("cls_name", message =>{
                                                        if(message === "") resolve();
                                                }));
                                        }
                                        await new Promise(resolve => this.$refs.form.validateField("cls_dic_id_major", message =>{
                                                if(message === "") resolve();
                                        }));
                                        await new Promise(resolve => this.$refs.form.validateField("cls_stf_id_teacher", message =>{
                                                if(message === "") resolve();
                                        }));
                                        await new Promise(resolve => this.$refs.form.validateField("cls_stf_id_admin", message =>{
                                                if(message === "") resolve();
                                        }));
                                        await new Promise(resolve => this.$refs.form.validateField("cls_stf_id_job", message =>{
                                                if(message === "") resolve();
                                        }));
                                }
                                        if(this.edit.mode){
                                            let id = await  this.$http({
	                                                url: "/class/add",
	                                                method: "post",
	                                                data: this.edit.model
                                                })
	                                         this.edit.model.cls_id = id
                                                this.classList.push(Object.assign({}, this.edit.model))
                                                this.$message({
                                                        message: `"${this.edit.model.cls_name}" 班级，新增成功!`,
                                                        type: "success"
                                                });
                                        }else{
                                              await this.$http({
	                                              url: "/class/update",
	                                              method: "post",
	                                              data: this.edit.model
                                              });
                                                let i = this.classList.findIndex(item => item.cls_id === this.edit.model.cls_id);
                                                this.classList.splice(i,1,Object.assign({},this.edit.model));
                                                this.$message({
                                                        message: `"${this.edit.model.cls_name}" 班级，修改成功！`,
                                                        type: "success"
                                                });
                                        };
                                        this.edit.isEdit = false;
		        },
		        initStaff(){
                                this.$http({url: "/staff/listbycategory/4"}).then(list => this.staffCoordinator = list);
                                this.$http({ url: "/staff/listbycategory/5"}).then(list => this.staffAdmin = list);
                                this.$http({url: "/staff/listbycategory/6"}).then(list => this.staffSinology = list);
		        }
	        },
                watch: {
                        'edit.isEdit'(newValue) {
                                if(newValue === false) delete this.userNameValidateResult;
                        }
                },
	       created(){
                    this.initStaff();
                      this.init();
                      this.getList();
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
		margin-top: 20px;
		padding-top: 0 ;
	}
	.invalid_cen{
		color: red;
	}
</style>