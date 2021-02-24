<template>
        <div class="page-wrapper">
	         <div class="logo-wrapper">
	             <h1>潍坊科技学院教务管理系统</h1>
	         </div>
	        <el-form :model="model" :rules="rule" ref="form"  status-icon>
		        <h3>系统登录</h3>
		        <el-form-item prop="user_name">
			        <el-input suffix-icon="el-icon-s-custom"
			                  v-model="model.user_name"
			                  placeholder="请输入用户名">
			        <template slot="prepend"><span class="prepend-text">用户名：</span></template>
			        </el-input>
		        </el-form-item>
		        <el-form-item prop="user_pwd">
			        <el-input suffix-icon="el-icon-lock" placeholder="请输入密码"  showPassword  v-model="model.user_pwd">
			        <template slot="prepend"><span class="prepend-text">密码：</span></template>
			        </el-input>
		        </el-form-item>
		        <el-form-item class="button-wrapper">
			        <el-button plain @click="login">登录</el-button>
		        </el-form-item>
	        </el-form>
        </div>
</template>

<script type="text/ecmascript-6">
         export default {
                 name: "Login",
                 data(){
                         return {
                                 model: {
                                         user_name: "",
                                         user_pwd: ""
                                 },
	                         rule: {
                                        user_name:[
                                                { required: true, message: '*请输入姓名', trigger: 'blur' },
                                                { min: 2, max: 10, message: '*请输入长度在 2 到 10 个字符', trigger: 'blur' },
                                                {
                                                        required: true,
                                                        pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9.·-]+$/,
                                                        message: '*姓名不支持特殊字符',
                                                        trigger: 'blur'
                                                }
                                        ],
                                         user_pwd: [
                                                 { required: true, message: '*请输入密码', trigger: 'blur' },
                                                 { min: 6, max: 20, message: '*请输入长度为6-20的数字和英文组合', trigger: 'blur' },
                                                 {
                                                         required: true,
                                                         pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/,
                                                         message: '*请输入正确的密码',
                                                         trigger: 'blur'
                                                 }
                                         ]
	                         },
	                         test:{}
                         }
                 },
                 methods: {
                         login(){
                                 this.$refs.form.validate(async valid => {
                                         if (!valid) {
                                                 return false
                                         } else {
                                                 let token = await this.$http({
                                                         url: "/user/login",
                                                         method: "post",
                                                         data: this.model
                                                 });
                                                 sessionStorage.setItem("token", token);
                                                 sessionStorage.setItem("user_name", this.model.user_name);
                                                 this.$router.replace("/home");
                                         }
                                 });

                                         },
                 }
         }
</script>

<style scoped>
.page-wrapper{
	width: 100%;
	height:100%;
	background: url("./timg.jpg");
	background-size: 100% 100%;
}
.logo-wrapper{
	perspective: 500px;
	position: fixed;
	top:50%;
	right: 20%;
	transform: translateY(-50%);
	animation-name:b;
	animation-delay: 1s;
	animation-duration: 1s;
	animation-fill-mode: forwards;
}
@keyframes a {
	0% {transform: rotateY(0deg) }
	100% {transform: rotateY(45deg) }
}
@keyframes b {
	0% {right: 20% }
	100% {right: 10% }
}
h1{
	animation-name:a ;
	animation-duration: 1s;
	animation-fill-mode: forwards;
	transform-origin: left center;
	font-size: 80px;
	color: #fff;
	border-bottom: 1px solid #b0b0b0;
	text-shadow: -10px 10px 10px #999;
	white-space: nowrap;
	position: relative;
	padding: 30px 50px;
}
 .el-form{
	 width:300px;
	position: absolute;
	 top:50%;
	 padding: 30px 70px;
	 border-radius: 24px;
	 box-shadow: 0 0 50px 1px;
	 left: 60%;
	 transform: translateY(-50%);
 }
 .prepend-text{
		display: inline-block;
		width: 40px;
 }
.button-wrapper{
	text-align: center;
}
h3{
	font-size: 21px;
	text-align: center;
	color: #FFFFFF;
}
</style>