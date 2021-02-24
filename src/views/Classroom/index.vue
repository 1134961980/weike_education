<template>
	<div>
              <div class="header">
	              <i class="yes"></i>
	              <span>闲置</span>
	              <i class="no"></i>
	              <span>使用中</span>
              </div>
		<el-row :gutter="20">
			<el-col :span="6" v-for="item in classrooms" :key="item.clsr_id">
				<el-card shadow="hover"  :class="{active:!item.clsr_occupy}">
					<span v-text="item.clsr_name"></span>
					<div class="button-wrapper">
						<el-button type="text" @click="beginUpdate(item)"><i
							class="el-icon-edit-outline"></i></el-button>
						<el-button type="text" v-if="!item.clsr_occupy" @click="beginDel(item)"><i
							class="el-icon-delete"></i></el-button>
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
			:title="edit.isAdd? '教室管理 - 新增' : '教室管理 - 编辑'"
			:visible="edit.isEdit"
			width="500px"
			:show-close="false"
			:modal="false"
			:close-on-click-modal="false">
			<el-form ref="form" :model="edit.model" :rules="rules">
				<el-form-item label="教室名字：" prop="clsr_name">
					<el-input
						type="text"
						placeholder="请输入教室名称"
						v-model="edit.model.clsr_name"
						class="name-enty"
						maxlength="20"
						show-word-limit>
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit = false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
import {createNamespacedHelpers} from "vuex";
let {mapState, mapActions} = createNamespacedHelpers("classroom");
        export default {
                name: "Classroom",
                data(){
                        return {
                            edit: {
                                    isEdit: false,
                                    isAdd:true,
	                            model:{clsr_id: 0, clsr_name: "", clsr_occupy: 0}
                            },
	                     rules: {
                                    clsr_name: [
                                             {
                                                     validator: (rule, value, callback) =>{
                                                             if(value.length === 0) callback(new Error('*教室名称不能为空'));
                                                             else if(value.length < 1 || value.length > 20) callback(new Error('*教室名称长度为1-20'));
                                                             else if(this.classrooms.some(item => item.clsr_id !== this.edit.model.clsr_id && item.clsr_name === this.edit.model.clsr_name))
                                                                     callback(new Error('*教室已经存在'));
                                                             else
                                                                     callback()          //通过验证
                                                     }, trigger: "blur"
                                             }
                                     ]
	                     }
                        }
                },
	        methods: {
                        ...mapActions(['init', 'removeClsr', 'clsrAdd', 'updateClsr']),
                        beginAdd() {
                                this.$refs.form && this.$refs.form.resetFields();
                               this.edit.isAdd  = true;
	                        this.edit.model ={clsr_id: 0, clsr_name: "", clsr_occupy: 0};
	                       this.edit.isEdit  = true
                        },
                        beginUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.isAdd = false;
	                        this.edit.isEdit  = true;
	                         this.edit.model.clsr_name = node.clsr_name;
                                this.edit.model.clsr_id = node.clsr_id;
                                this.edit.model.clsr_occupy = node.clsr_occupy
                        },
                        beginDel(node) {
                          this.$confirm(`是否要永久删除"${node.clsr_name}"教室？`, '提示',{
                                  confirmButtonText: '确定',
                                  cancelButtonText: '取消',
                                  type: 'warning'
                          }).then(async () => {
                                  await this.removeClsr(node.clsr_id)
                                  this.$message({
                                          message: `${node.clsr_name}节点删除成功`,
                                          type: 'success'
                                  });
                          }).catch(() =>{
                          })
                        },
		        save() {
                                this.$refs.form.validate(async valid =>{
                                        if(!valid) return;
                                        if(this.edit.isAdd){
                                                this.clsrAdd(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `${this.edit.model.clsr_name}教室新增成功`,
                                                        type: 'success'
                                                });
                                        }else{
                                                await this.updateClsr(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `${this.edit.model.clsr_name}教室编辑成功`,
                                                        type: 'success'
                                                });
                                        }
                                        this.edit.isEdit = false;
                                })
                        }
	        },
	        computed: {
		        ...mapState(['classrooms']),
	        },
	       async created() {
                       await this.init()
	        }
        }
</script>

<style scoped>
.header{
	display: flex;
	align-items: center;
}
.header span{
	margin-left: 6px;
}
.header i{
	width: 20px;
	height:20px;
	margin-left: 20px;
}
.yes {
	background: #000;
}
 .no {
	 background: #666;
 }
.el-col {
	margin-top: 30px;
}

.el-card {
	text-align: center;
	padding: 35px 0;
	background: #898989;
	color: #fff;
	font-size: 18px;
	cursor: pointer;
	position: relative;
}
.active{
	background:  #000;
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
	color: orange;
	font-weight: bold;
	border: 2px dashed orange;
}
</style>