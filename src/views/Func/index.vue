<template>
	<div>
		<el-tree :data="treeeData" default-expand-all class="custom-tree" :expand-on-click-node="false">
                                 <span slot-scope="{ node, data }" class="custom-tree-node" >
	                                <span v-text="data.func_name" :class="{ root:data.func_id === 0, unleaf: data.func_key === '', leaf: data.func_key !== '' }"></span>
	                                 <span>
		                                 <el-button  type="text" v-if="data.func_key===''" @click="addBtn(data)"><i class="el-icon-plus" v-if="data.func_key===''"></i></el-button>
		                                  <el-button type="text" v-if="data.func_id!==0" @click="updateBtn(data)"><i class="el-icon-edit"></i></el-button>
		                                  <el-button type="text" v-if="[0,44,45].indexOf(data.func_id)===-1" :disabled="typeof(data.children)!=='undefined'" @click="remove(data)">
			                                  <i class="el-icon-delete"></i>
		                                  </el-button>
	                                 </span>
                                 </span>
		</el-tree>

		<el-dialog  title="系统功能维护 - 新增" :visible.sync="edit.isEdit"
		            width="600px" :show-close="false"
		            :close-on-click-modal="false"
		            :modal="false"
		            :close-on-press-escape="false">
			<el-form ref="form" :model="edit.model" :rules="rules"   label-width="140px" hide-required-asterisk>
				<el-form-item label="系统功能节点:">
					<template>
						<el-radio v-model="edit.isLeaf" :label="false" :disabled="!(edit.mode && edit.model.func_fid===0)">非叶子节点</el-radio>
						<el-radio v-model="edit.isLeaf" :label="true"  :disabled="!(edit.mode && edit.model.func_fid===0)">叶子节点</el-radio>
					</template>
				</el-form-item>
				<el-form-item label="父级节点名称: " >
					<el-select v-model="edit.model.func_fid" :disabled="edit.mode || !edit.isLeaf">
						<el-option
							v-for="item in selectData"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统功能名称:"   prop="func_name">
					<el-input v-model.trim="edit.model.func_name" placeholder="请输入系统功能名称"></el-input>
				</el-form-item>
				<el-form-item label="绑定组件:"  v-show="edit.isLeaf" prop="func_key">
						<el-select v-model="edit.model.func_key">
							<el-option
								v-for="item in Object.keys(views)"
								:key="item"
								:label="item"
								:value="item"
								:disabled="list.findIndex(func=>func.func_key===item)!==-1">
							</el-option>
						</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click=" edit.isEdit = false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
import views from "../../views"
import {createNamespacedHelpers} from "vuex";
let {mapState, mapGetters, mapActions} = createNamespacedHelpers("func");

        export default {
                name: "Func",
                data(){
                        return {
                                views,
	                        edit: {
                                  isEdit: false,   //用于标识是否开启弹层
		                  mode: true,   //用于确定操作模式true为新增
		                  isLeaf: true,   //是否为叶子节点
		                  model: {func_id: 0,  func_name: "", func_key: "",func_fid: -1},
	                        },
                                rules:{
                                        func_name:[
                                                {
                                                        validator: (rule, value, callback) =>{
                                                                let { func_id, func_name, func_fid }=this.edit.model;   //es6中的解构负值
                                                                if(value.length === 0) callback(new Error('*功能名称不能为空'));
                                                                else if(value.length<2 || value.length >50) callback(new Error('*功能名称长度为2-50'));
                                                                else if(this.list.some(item=>item.func_id!==func_id && item.func_name===func_name && item.func_fid===func_fid))
                                                                        callback(new Error('*功能名称在当前父级节点中已存在'));
                                                                else
                                                                        callback()          //通过验证
                                                        },trigger: "blur"
                                                }
                                        ],
                                        func_key:[
                                                {
                                                        validator: (rule, value, callback) =>{
                                                                if(this.edit.mode && this.edit.isLeaf && value==="")
                                                                        callback(new Error('*叶子节点必须绑定组件！'));
                                                                else
                                                                        callback()          //通过验证
                                                        },trigger: "change"
                                                }
                                        ]
                                }
                        };
                },
                computed: {
	                ...mapState(["list"]),
	                ...mapGetters(["listToTree"]),
                        treeeData(){
                                return [{
                                        func_id: 0,
                                        func_name: "Root",
                                        func_key: "",
                                        func_fid: -1,
                                        children: this.listToTree
                                }];
                        },
	                selectData(){
                                let result = [{label: "Root", value: 0}];
                                this.list.filter(item => item.func_key==="").forEach(item =>{
                                        result.push({label: item.func_name , value: item.func_id})
                                })
                               return  result;
	                }
                },
                created(){
                      this.$store.dispatch("func/init")
                },
	        methods:{
		        ...mapActions(["init", "beginAdd", "removeFunc", "updateFunc"]),
                        remove(node){
                                this.$confirm(`是否要永久删除”${node.func_name}“节点`, '提示', {
                                        confirmButtonText: '确定',
                                        cancelButtonText: '取消',
                                        type: 'warning'
                                }).then(async()=>{
                                   await this.removeFunc( node.func_id)
                                        this.$message({
                                                message: `${node.func_name}节点删除成功`,
                                                type: 'success'
                                        });
                                }).catch(()=>{})
                        },
                        addBtn(parentNode){
                                 this.$refs.form  && this.$refs.form.resetFields();
                                this.edit.mode=true;
                              this.edit.isLeaf=parentNode.func_id!==0;
                              this.edit.model.func_fid=parentNode.func_id
                                this.edit.model.func_id=0;
                                this.edit.model.func_name="";
                                this.edit.model.func_key="";
                              this.edit.isEdit=true;
		        },
                        updateBtn(node){
                                this.edit.mode=false;
                                this.edit.isLeaf=node.func_key!=="";
                                this.edit.model.func_id=node.func_id;
                                this.edit.model.func_name=node.func_name;
                                this.edit.model.func_key=node.func_key;
                                this.edit.model.func_fid=node.func_fid;
                                this.edit.isEdit=true;
                        },
		        save(){
                                this.$refs.form.validate(async valid =>{
                                        if(!valid) return;
                                        if(this.edit.mode){
	                                        this.beginAdd(Object.assign({},this.edit.model))
                                                this.$message({
                                                        message: `"${this.edit.model.func_name}节点添加成功，请刷新"`,
                                                        type: "success"
                                                });
                                        }else{
                                               await this.updateFunc(Object.assign({},this.edit.model))
                                                this.$message({
                                                        message: `"${this.edit.model.func_name}节点修改成功，请刷新"`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false
                                })
		        }
	        }
        };
</script>

<style lang="stylus" type="text/stylus" scoped>
	.custom-tree
		width: 500px
		span.custom-tree-node
			flex: 1
			display: flex
			justify-content: space-between
			align-items center
			span.root
				color: brown !important
				font-weight: bold
			span.unleaf
				color: #0094ff
			span.leaf
				color: black
</style>