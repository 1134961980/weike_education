<template>
	<div>
		<el-container>
			<el-header>
				<el-form :inline="true" class="form">
					<el-form-item label="员工名字:" prop="stf_name" size="mini">
						<el-input prefix-icon="el-icon-search" v-model="search.stf_name"
						          placeholder="请输入姓名"
						          clearable  @change="getStaff()"></el-input>
					</el-form-item>
					<el-form-item label="员工类型:" prop="dic_id"  size="mini">
						<el-select v-model="search.stf_category" @change="categorySearch">
							<el-option label="所有类型" :value="0"></el-option>
							<el-option
								v-for="item in getGroupByKey('staff_category')"
								:key="item.dic_id"
								:label="item.dic_name"
								:value="item.dic_id"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item size="mini">
						<el-button class="btn-add" type="primary" icon="el-icon-plus" @click="beginAdd">新增</el-button>
					</el-form-item>
				</el-form>
			</el-header>
			<el-main>
				<template>
					<el-table :data="staffs" style="width: 100%" stripe border>
						<el-table-column type="index"  align="center"></el-table-column>
						<el-table-column prop="stf_name" label="员工名" width="80"></el-table-column>
						<el-table-column prop="stf_category" label="职务类型" width="150"  align="center">
							<template  slot-scope="{row}">
								<span  v-text="getGroupByKey('staff_category').find(item=>item.dic_id===row.stf_category).dic_name"></span>
							</template>
						</el-table-column>
						<el-table-column  label="备注">
							<template  slot-scope="{row}">
								<span v-if="row.stf_remark  !== ''"  v-text="row.stf_remark"></span>
								<span v-else>暂无相关备注</span>
							</template>
						</el-table-column>
						<el-table-column prop="stf_invalid" label="员工状态" width="80" align="center">
							<template  slot-scope="{row}">
								<span class="invalid-cen" v-text="!row.stf_invalid ? '离职' : '在职'"  :class="{invalid_cen: !row.stf_invalid}"></span>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="150">
							<template slot-scope="{ row }">
								<el-button  size="mini" type="primary" @click="beginUpdate(row)">编辑</el-button>
								<el-button v-if="!row.stf_invalid" size="mini" type="success" @click="importStaff(row)">在职</el-button>
								<el-button v-else size="mini" type="warning" @click="exportStaff(row)">离职</el-button>
							</template>
						</el-table-column>
					</el-table>
				</template>
			</el-main>
			<el-footer>
				<el-pagination
					background
					:total="pagination.total"
					@size-change="getStaff()"
					@current-change="getStaff(false)"
					:page-sizes="[6, 8, 10, 12, 15]"
					:page-size.sync='pagination.pageSize'
					:current-page.sync="pagination.currentPage"
					layout="prev,pager,next,jumper,->,total,sizes"
				>
				</el-pagination>
			</el-footer>
			<el-dialog :modal="false" :show-close="false" :visible="edit.isEdit"  width="500px"
			           :title="edit.mode? '员工管理-新增' : '员工管理-修改'" >
				<el-form ref="form" :model="edit.model" label-width="140px"   :rules="rules" status-icon>
					<el-form-item label="*员工名字：" prop="stf_name">
						<el-input placeholder="请输入员工名" v-model="edit.model.stf_name"></el-input>
					</el-form-item>
					<el-form-item label="*员工类型"  prop="stf_category">
						<el-select v-model="edit.model.stf_category" >
							<el-option
								v-for="item in getGroupByKey('staff_category')"
								:key="item.dic_id"
								:label="item.dic_name"
								:value="item.dic_id"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="*员工备注" prop="stf_remark">
						<el-input type="textarea"  placeholder="请输入备注" v-model="edit.model.stf_remark"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit= false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</span>
			</el-dialog>
		</el-container>
	</div>
</template>

<script type="text/ecmascript-6">
 import  {createNamespacedHelpers}  from "vuex";
 import ElButton from "../../../node_modules/element-ui/packages/button/src/button.vue";
 let  {mapGetters} = createNamespacedHelpers('dictionary')

        export default {
                components: {ElButton},
                name: "Staff",
                data(){
                        return {
                                search: {
                                        stf_category: 0,
                                        stf_name: ""
                                },
                                staffs: [],
                                pagination: {
                                        pageSize: 6,
                                        currentPage: 1,
                                        total: 0,
                                },
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        model: {stf_id: "", stf_name: "",  stf_category: 0,  stf_remark: "", stf_invalid: 1}
                                },
                                rules: {
                                        stf_name: [{
                                                validator: (rule, value, callback) =>{
                                                        if(value.length === ""){
                                                                callback(new Error('*名字不能为空'))
                                                        }
                                                      else if(! /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/.test(value)){
                                                                callback(new Error("员工名长度为2-20字符"))
                                                        }
                                                        else{
                                                                callback();
                                                        }
                                                },
                                                trigger: "blur"
                                        }],
                                        stf_category: [
                                                { required: true, message: '请选择教师类型', trigger: 'change' }
                                        ],
                                        stf_remark: [{
                                                validator: (rule, value, callback) =>{
                                                        if(value.length > 120){
                                                                callback(new Error('*备注长度不能超过120字'))
                                                        }
                                                        else{
                                                                callback();
                                                        }
                                                },
                                                trigger: "blur"
                                        }],
                                }
                        }
                },
	        computed: {
                        ...mapGetters(["getGroupByKey"]),
	        },
                methods: {
                        async getStaff(fromPage1 = true){
                                if(fromPage1) this.pagination.currentPage = 1;
                                let {list, total} = await this.$http({
                                        url: "/staff/list",
                                        method: "post",
                                        data: {
                                                ...this.search,
                                                begin: this.pagination.pageSize * (this.pagination.currentPage - 1),
                                                pageSize: this.pagination.pageSize
                                        }
                                });
                                this.staffs = list;
                                this.pagination.total = total;
                        },
                        beginAdd(){
                                this.edit.mode = true;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.model.stf_name = "";
                                this.edit.model.stf_category = null;
                                this.edit.model.stf_remark = "";
                                this.edit.isEdit = true;
                        },
                        beginUpdate(staff){
                                this.edit.mode = false;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.model.stf_name = staff.stf_name;
                                this.edit.model.stf_category = staff.stf_category;
                                this.edit.model.stf_remark = staff.stf_remark;
                                this.edit.model.stf_id = staff.stf_id;
                                this.edit.model.stf_invalid = staff.stf_invalid
                                this.edit.isEdit = true
                        },
                        async save(){
                                this.$refs.form.validate(async valid =>{
                                        if(!valid) return;
                                        if(this.edit.mode){
                                               let id =await this.$http({
                                                        url: "/staff/add",
                                                        method: "post",
                                                        data: this.edit.model
                                                })
                                                this.edit.model.stf_id = id;
                                                this.staffs.push(Object.assign({}, this.edit.model))
                                                this.$message({
                                                        message: `"${this.edit.model.stf_name}" 员工，新增成功!`,
                                                        type: "success"
                                                });
                                        }else{
                                                await this.$http({
                                                        url: "/staff/update",
                                                        method: "post",
                                                        data: this.edit.model
                                                })
                                                let i = this.staffs.findIndex(item => item.stf_id === this.edit.model.stf_id)
                                                this.staffs.splice(i,1,Object.assign({},this.edit.model))
                                                this.$message({
                                                        message: `"${this.edit.model.stf_name}" 员工，修改成功！`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;
                                })
                        },
	                async categorySearch(){
                                if(this.search.stf_category === 0) {
                                        this.getStaff()
	                                return
                                } ;
                                let list = await this.$http({
                                        url: "/staff/listbycategory/" + this.search.stf_category,
                                });
                                this.staffs = list;
                                this.pagination.total = list.length;
	                },
                        async importStaff (node) {
                                this.$confirm('是否入职该员工?', '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                }).then(async () => {
                                       await this.$http({url: "/staff/reinstate/" + node.stf_id})
                                        this.staffs.forEach(item => {
                                                if(item.stf_id === node.stf_id){
                                                        item.stf_invalid = 1;
                                                }
                                        });
                                        this.$message({
                                                type: 'success',
                                                message: '入职成功!'
                                        });
                                }).catch(() => {
                                        this.$message({
                                                type: 'info',
                                                message: '已取消入职'
                                        });
                                });
                        },
                        async exportStaff (node) {
                                this.$confirm('是否离职该员工?', '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                }).then(async () => {
                                        await this.$http({
	                                        url: "/staff/dimission/" + node.stf_id,
                                        })
	                                this.staffs.forEach(item => {
	                                        if(item.stf_id === node.stf_id){
	                                                item.stf_invalid = 0;
	                                        }
	                                });
                                        this.$message({
                                                type: 'success',
                                                message: '离职成功!'
                                        });
                                }).catch(() => {
                                        this.$message({
                                                type: 'info',
                                                message: '已取消离职'
                                        });
                                });
                        }
                },
                async created(){
                        console.log(this.getGroupByKey('staff_category'))
                        this.getStaff()
                },
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