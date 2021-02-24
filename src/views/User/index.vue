<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="用户名:" prop="user_name">
					<el-input prefix-icon="el-icon-search" v-model="search.user_name"
					          placeholder="请输入姓名"
					          clearable @change="getUser()"></el-input>
				</el-form-item>
				<el-form-item label="用户角色:" prop="role_id" >
					<el-select v-model="search.role_id" @change="getUser()">
						<el-option label="全部" :value="-1"></el-option>
						<el-option label="无角色" :value="0"></el-option>
						<el-option
							v-for="item in roleList"
							:key="item.role_id"
							:label="item.role_name"
							:value="item.role_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" icon="el-icon-plus" @click="beginAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<template>
				<el-table :data="userList" style="width: 100%" stripe border>
					<el-table-column type="index" align="center"></el-table-column>
					<el-table-column prop="user_name" label="用户名" width="150"></el-table-column>
					<el-table-column label="用户角色" width="150" align="center">
						<template  slot-scope="{row}">
							<span v-if="row.role_id!==null && roleList.length > 0" v-text="roleList.find(item=>item.role_id===row.role_id).role_name"></span>
							<span v-else class="no-role">无角色</span>
						</template>
					</el-table-column>
					<el-table-column label="操作">
						<template slot-scope="{ row }">
							<el-button size="small" type="primary" icon="el-icon-edit"  @click="beginUpdate(row)"></el-button>
							<el-button size="small" type="warning" icon="el-icon-delete" @click="beginDel(row.user_name)"></el-button>
							<el-popover placement="right">
								<el-button @click="beginRoleFuncConfig(row)"
									slot="reference" icon="el-icon-setting"
									size="small" type="success">角色分配</el-button>
								<el-form  inline>
									<el-form-item label="角色：">
										<el-select v-model="edit.user.role_id">
											<el-option label="-无角色-"  :value="0"></el-option>
											<el-option
												v-for="item in roleList"
												:key="item.role_id"
												:label="item.role_name"
												:value="item.role_id"></el-option>
										</el-select>
										<el-button @click="roleFuncConfig">分配</el-button>
									</el-form-item>
								</el-form>
							</el-popover>
						</template>
					</el-table-column>
				</el-table>
			</template>
		</el-main>
		<el-footer>
			<el-pagination
				background
				:total="pagination.total"
				@size-change="getUser()"
				@current-change="getUser(false)"
				:page-sizes="[6, 8, 10, 12, 15]"
				:page-size.sync='pagination.pageSize'
				:current-page.sync="pagination.currentPage"
				layout="prev,pager,next,jumper,->,total,sizes"
				>
			</el-pagination>
		</el-footer>
		<el-dialog :visible="edit.isEdit" :show-close="false"  :title="edit.mode? '用户管理-新增' : '用户管理-修改'">
			<el-form ref="form" :model="edit.user" label-width="140px" :rules="rules" status-icon @validate="formValidateHandler">
				<el-form-item label="用户名称" prop="user_name" v-if="edit.mode">
					<el-input placeholder="请输入用户名" v-model.trim="edit.user.user_name"></el-input>
				</el-form-item>
				<el-form-item label="密码" type="user_pwd" prop="user_pwd">
					<el-input placeholder="请输入用户密码" v-model.trim="edit.user.user_pwd"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit= false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import {createNamespacedHelpers} from "vuex";

        let {mapState, mapActions} = createNamespacedHelpers("role");
        export default {
                name: "User",
                data(){
                        return {
                                flag: false,
                                userNameValidateResult:  undefined,
                                pagination: {
                                        pageSize: 6,
                                        currentPage: 1,
                                        total: 0,
                                },
                                userList: [],
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        user: {user_name: "", user_pwd: "", role_id: null}
                                },
                                search: {
                                        role_id: -1,
                                        user_name: ""
                                },
                                rules: {
                                        user_name: [{
                                                validator: async (rule, value, callback) =>{
                                                        //ES6中的解构赋值
                                                        if(!this.edit.mode){
                                                                callback();
                                                        }
                                                        else if(!/^[a-zA-Z][a-zA-Z0-9]{2,19}$/.test(value)){
                                                                callback(new Error("用户名长度为3-20字母数字组合，以字母开头"))
                                                        }
                                                        else if(await  this.$http({url: "/user/valid_name", method: "post", data: {user_name:this.edit.user.user_name}})){
                                                                callback(new Error("用户名已存在！"))
                                                        }
                                                        else{
                                                                callback();
                                                        }
                                                },
                                                trigger: "blur"
                                        }],
                                        user_pwd: [{
                                                validator: (rule, value, callback) =>{
                                                        //ES6中的解构赋值
                                                        if(value.length === 0){
                                                                callback(new Error('*密码不能为空'))
                                                        }
                                                        else if(! /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/.test(value)){
                                                                callback(new Error('*用户密码长度为6-20'))
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
                        ...mapState({roleList: "roles"})
                },
                methods: {
                        ...mapActions(["init"]),
                        async getUser(fromPage1=true){
                                //判断是否从第一页开始看
                                if(fromPage1) this.pagination.currentPage = 1;
                                let {list,total} = await this.$http({
                                        url: "/user/list",
                                        method: "post",
                                        data: {
                                                ...this.search,
                                                begin: this.pagination.pageSize*(this.pagination.currentPage-1),
                                                pageSize: this.pagination.pageSize
                                        }
                                });
                                this.userList=list;
                                this.pagination.total=total;
                        },
                        async beginDel(user_name){
                                this.$confirm(`确定删除用户:"${user_name}"`,"提示",{type: "waring"})
	                                .then(async()=>{
                                                await this.$http({url: "/user/remove/" + user_name, method: "post"})
		                                let i = this.userList.findIndex(item => item.user_name === user_name);
                                                this.userList.splice(i, 1);
                                                this.$message({message: user_name + "用户，删除成功!", type: "success"});
	                                }).catch(()=>{});
                        },
                        beginAdd(){
                                this.edit.mode = true;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.user.user_name = "";
                                this.edit.user.user_pwd = "";
                                this.edit.user.role_id = null;
                                this.edit.isEdit = true
                        },
                        beginUpdate(obj){
                                this.edit.mode = false;
                                this.$refs.form && this.$refs.form.resetFields();//重置表单
                                this.edit.user.user_pwd = obj.user_pwd;
                                this.edit.user.user_name = obj.user_name;
                                this.edit.user.role_id = obj.role_id;
                                this.edit.isEdit = true
                        },
                       formValidateHandler(prop, valid, message){
                                if(prop === "user_name") this.userNameValidResult = valid;
                       },
                        async save(){
                          if(this.edit.mode) {
                                  if(this.userNameValidateResult ===false) return;
                                  if(typeof  this.userNameValidateResult === "undefined") {
                                          await  new Promise(resolve => this.$refs.form.validateField("user_name", message => {
                                                  if(message === "") resolve();
                                          }));
                                  }

                                  await new Promise(resolve => this.$refs.form.validateField("user_pwd",message => {
                                          if(message === "") resolve();
                                  }));

                                        if(this.edit.mode){
                                                await this.$http({
                                                        url: "/user/add",
                                                        method: "post",
                                                        data: this.edit.user
                                                })
                                                this.userList.push(Object.assign({}, this.edit.user))
                                                this.edit.isEdit = false;
                                                this.$message({
                                                        message: `"${this.edit.user.user_name}"用户，新增成功!`,
                                                        type: "success"
                                                });
                                        }else{
                                                await this.$http({
                                                        url: "/user/change_pwd",
                                                        method: "post",
                                                        data: this.edit.user
                                                })
                                                let i = this.userList.findIndex(item => item.user_name === this.edit.user.user_name);
                                                this.userList[i].user_pwd = this.edit.user.user_pwd;
                                                this.$message({
                                                        message: `"${this.edit.user.user_name}" 角色，修改成功！`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;
                                }
	                        },
                        beginRoleFuncConfig(user) {
                                this.edit.user.user_name = user.user_name;
                                this.edit.user.role_id = user.role_id || 0;
                        },
                       async  roleFuncConfig() {
                                await this.$http({
	                                url: "/user/config_role",
	                                method:"post",
	                                data: this.edit.user});
                                let target =this.userList.find(item => item.user_name === this.edit.user.user_name)
	                        target.role_id = this.edit.user.role_id || null;
	                         this.$message({message: `用户：${this.edit.user.user_name}, 角色分配成功！`,type:"success" })
                          }
                        },
                watch: {
                        'edit.isEdit'(newValue) {
                                if(newValue === false) delete this.userNameValidateResult;
                        }
                },
                created(){
                        this.init()
                        this.getUser()
                },
        }
</script>

<style lang="stylus" type="text/stylus" scoped>
	.el-container
		position: absolute
		left: 0
		top: 0
		height: 100%
		width: 100%
		.el-footer
			display: flex
			align-items: center
			.el-pagination
				flex-grow: 1
	 .el-header{
		padding-top 20px;
	}
	.el-main{
		margin-top 20px;
		padding-top 0 ;
	}
</style>