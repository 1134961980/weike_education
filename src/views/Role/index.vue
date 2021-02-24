<template>
	<div>
		<el-row :gutter="20">
			<el-col :span="6" v-for="item in roles" :key="item.role_id">
				<el-card shadow="hover">
					<span v-text="item.role_name"></span>
					<div class="button-wrapper">
						<el-button type="text" @click="beginUpdate(item)"><i
							class="el-icon-edit-outline"></i></el-button>
						<el-button type="text" @click="beginDel(item)"><i
							class="el-icon-delete"></i></el-button>
						<el-button type="text" @click="beginRoleFuncConfig(item.role_id)">功能分配</el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover" @click.native="beginAdd" class="btn-add">
					<i class="el-icon-circle-plus-outline"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog
			center
			:title="edit.isAdd? '角色管理-新增' : '角色管理-编辑'"
			:visible="isEdit"
			width="500px"
			:show-close="false"
			:close-on-click-modal="false">
			<el-form ref="form" :model="edit.model" :rules="rules">
				<el-form-item label="角色名称：" prop="role_name">
					<el-input
						type="text"
						placeholder="请输入角色名称"
						v-model="edit.model.role_name"
						class="name-enty"
						maxlength="20"
						show-word-limit>
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="isEdit = false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</div>
		</el-dialog>
		<!--抽屉-->
		<el-drawer
			class="custom-drawer"
			size="600px"
			:modal="false"
			:visible.sync="edit2.isEdit"
			:show-close="false"
		>
			<h3 slot="title">学生/老师 - 功能分配</h3>
			<el-tree
				class="custom-tree"
				:data="edit2.treeData"
				default-expand-all
				:expand-on-click-node="false"
			>
				<span
					class="custom-tree-node"
					:class="{parent: data.func_key === ''}"
					slot-scope="{node, data}"
				>
					<span>
						<i v-if="data.func_key !== ''" class="el-icon-paperclip"></i>
						<span v-text="data.func_name"></span>
					</span>
					<span class="switch-wrapper">
						<el-switch
							v-model="data.open"
							@change="switchChangeHandler(data)"
						></el-switch>
					</span>
				</span>
			</el-tree>
			<div class="drawer-footer">
				<el-button type="primary" @click="roleFuncConfig">确定</el-button>
				<el-button @click="edit2.isEdit = false">取消</el-button>
			</div>
		</el-drawer>
	</div>
</template>

<script type="text/ecmascript-6">
        import {createNamespacedHelpers} from 'vuex';
        //一对一映射
        let {mapState, mapActions} = createNamespacedHelpers("role");
        let {mapGetters: mapGettersFromFunc, mapActions: mapActionsFromFunc} = createNamespacedHelpers("func");
        //  一对多映射 es6 结构起别名 用：
        export default {
                name: "Role",
                data(){
                        return {
                                isEdit: false,
                                edit: {
                                        isAdd: true,
                                        model: {role_name: "", role_id: 0}
                                },
                                //角色功能分配
                                edit2: {
                                        isEdit: false,  //是否进行角色功能分配
	                                model: {
                                                role_id: 0,
		                                role_func_ids: '',
	                                },
	                                treeData: []
                                },
                                rules: {
                                        role_name: [
                                                {
                                                        validator: (rule, value, callback) =>{
                                                                if(value.length === 0) callback(new Error('*角色名称不能为空'));
                                                                else if(value.length < 2 || value.length > 20) callback(new Error('*角色名称长度为2-20'));
                                                                else if(this.roles.some(item => item.role_id !== this.edit.model.role_id && item.role_name === this.edit.model.role_name))
                                                                        callback(new Error('*角色已经存在'));
                                                                else
                                                                        callback()          //通过验证
                                                        }, trigger: "blur"
                                                }
                                        ]
                                },

                        }
                },
                methods: {
                        ...mapActionsFromFunc({'initFunc': 'init'}),
                        ...mapActions(['init', 'removeRole', 'roleAdd', 'updateRole']),
	                //根据listToTree与roleFuncIds   两个数据来算出树的treeData,让树去绑定treeData, 在listToTree和roleFuncIds    变化时触发调用
                        updateTreeData(roleFuncIds) {
                                let result = JSON.parse(JSON.stringify(this.listToTree));
                                result.forEach(item => {
                                        item.open = roleFuncIds.indexOf(item.func_id) !== -1; //给非叶子添加open
                                        item.children && item.children.forEach(item2 => {   //给叶子添加open
                                                item2.open = roleFuncIds.indexOf(item2.func_id) !== -1;
                                        })
                                });
                                this.edit2.treeData = result;
                        },
	                beginDel(node){
                                this.$confirm(`是否要永久删除"${node.role_name}"角色？`, '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                }).then(async() =>{
                                        await this.removeRole(node.role_id)
                                        this.$message({
                                                message: `${node.role_name}节点删除成功`,
                                                type: 'success'
                                        });
                                }).catch(() =>{
                                })
                        },
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.isAdd = true;
                                this.isEdit = true
                        },
                        beginUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.isAdd = false;
                                this.isEdit = true;
                                this.edit.model.role_name = node.role_name;
                                this.edit.model.role_id = node.role_id;
                        },
                        save(){
                                this.$refs.form.validate(async valid =>{
                                        if(!valid) return;
                                        if(this.edit.isAdd){
                                                this.roleAdd(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `${this.edit.model.role_name}角色新增成功`,
                                                        type: 'success'
                                                });
                                        }else{
                                                await this.updateRole(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `${this.edit.model.role_name}角色编辑成功`,
                                                        type: 'success'
                                                });
                                        }
                                        this.isEdit = false;
                                })
                        },
	                //开始用户功能管理分配
                        async beginRoleFuncConfig(role_id) {
				//发送Ajax
	                        let roleFuncs = await this.$http({
		                        url: '/role_function/list/' + role_id
	                        });
	                        let roleFuncIds = roleFuncs.reduce((result, item) => {
	                               result.push(item.func_id);
	                               return result;
	                        }, []);
	                        this.updateTreeData(roleFuncIds);
	                        this.edit2.model.role_func_ids = '';
	                        this.edit2.model.role_id  = role_id;
                                this.edit2.isEdit = true;
                        },
	                //switch 发生改变 实时维护数据 发送ajax
                        switchChangeHandler(node) {
				if(node.func_key === '') { // 非叶子
				        node.children && node.children.forEach(item => item.open = node.open);
				} else {  // 叶子节点
				        let parent = this.edit2.treeData.find(item => item.func_id === node.func_fid)
					parent.open = parent.children.some(item => item.open);
				}
                        },
	                // 点击确定
                        async roleFuncConfig() {
                                //发Ajax前统计树中所有open的节点的func_id
	                        let func_ids = [];
	                        this.edit2.treeData.forEach(item => {
	                                if(item.open) func_ids.push(item.func_id);
	                                item.children && item.children .forEach(item2 => {
                                                if(item2.open) func_ids.push(item2.func_id);
	                                });
	                        });
	                        this.edit2.model.role_func_ids = func_ids.join(',');
	                        //发Ajax
	                        await this.$http({ method: 'post', url: '/role_function/config', data: this.edit2.model });
	                        //ajax成功返回后的相应界面变化
	                        this.edit2.isEdit = false;
	                        this.$message({ message: "角色功能分配成功！", type: 'success' });
                        }
                },
	        watch: {
		        listToTree() {
                                this.edit2.isEdit = false;
                                this.updateTreeData([]);
		        }
	        },
                computed: {
                        ...mapState(['roles']),
                        ...mapGettersFromFunc(["listToTree"])
                },
                async created(){
                        //获取所有角色
                        await this.init();
                        //获取所有功能
                        await this.initFunc();
                }
        }
</script>

<style scoped>
	.el-col {
		margin-top: 30px;
	}

	.el-card {
		text-align: center;
		padding: 35px 0;
		background: deepskyblue;
		color: #fff;
		font-size: 18px;
		cursor: pointer;
		position: relative;
	}

	.el-card span {
		padding: 0 20px;
		white-space: nowrap;
		overflow: hidden;
		text-emphasis: none;
		width: 100%;
	}

	.button-wrapper {
		position: absolute;
		bottom: 0;
		right: 10px;
	}

	.el-col .el-button {
		font-size: 18px;
		color: #FFFFFF;
	}

	.btn-add {
		background: #fff;
		color: deepskyblue;
		font-weight: bold;
		border: 2px dashed deepskyblue;
	}

	.name-enty {
		width: 300px;
	}

	.custom-tree {
		width: 500px;
		margin: 30px 0 50px 50px;
	}

	.custom-tree-node {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.parent {
		padding-right: 50px;
		color: #0094ff;
	}

	.drawer-footer {
		text-align: center;
	}
</style>