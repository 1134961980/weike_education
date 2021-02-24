<template>
	<el-form label-width="100px" :model="model"
	         status-icon
	         :rules="rules"
	         ref="form"
	>
		<el-form-item label="原始密码:" prop="oldPwd">
			<el-col :span="8">
				<el-input v-model="model.oldPwd" :show-password="true"></el-input>
			</el-col>
		</el-form-item>
		<el-form-item label="新密码:" prop="newPwd">
			<el-col :span="8">
				<el-input v-model="model.newPwd" :show-password="true"></el-input>
			</el-col>
		</el-form-item>
		<el-form-item label="新密码确认:" prop="again">
			<el-col :span="8">
				<el-input v-model="model.again" :show-password="true"></el-input>
			</el-col>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="save">确定</el-button>
		</el-form-item>
	</el-form>
</template>

<script type="text/ecmascript-6">
        import router from  "vue-router";

        export default {
                name: "EditPwd",
                data(){
                        return {
                                model: {oldPwd: "", newPwd: "", again: ""},
                                rules: {
                                        oldPwd: [
                                                {required: true, message: '原始密码必填', trigger: 'blur'},
                                                {min: 2, max: 20, message: '密码长度3-20', trigger: 'blur'}
                                        ],
                                        newPwd: [
                                                {required: true, message: '新密码必填', trigger: 'blur'},
                                                {
                                                        validator: (rule, value, callback) =>{
                                                                if(value.length < 2 || value.length > 20) callback(new Error('密码长度3-20'))
                                                                else if(value === this.model.oldPwd) callback(new Error('新旧密码一样请重新输入！'))
                                                                else callback();
                                                        },
                                                        trigger: "blur"
                                                }
                                        ],
                                        again: [{required: true, message: '请再次输入密码', trigger: 'blur'},
                                                {
                                                        validator: (rule, value, callback) =>{
                                                                if(value !== this.model.newPwd) callback(new Error('两次密码输入不一致！'))
                                                                else callback();
                                                        },
                                                        trigger: "blur"
                                                }
                                        ]
                                }
                        }
                },
                methods: {
                        save(){
                                this.$refs.form.validate(async valid =>{
                                        if(!valid) return;
                                        await this.$http({
                                                url: "/user/pwdchange",
                                                method: "post",
                                                data: {
                                                        ...this.model
                                                }
                                        },true)
                                        this.$message({
                                                showClose: true,
                                                message: "修改成功！请重新登录~",
                                                type: 'success'
                                        });
                                        sessionStorage.clear();
                                        this.$router.replace('/');
                                })
                        }
                }
        };
</script>


<style scoped>

</style>