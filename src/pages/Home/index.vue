<template>
	<el-container class="page-container">
		<el-header height="80px">
			      <span v-text="'欢迎' + token"></span>
				<h1>潍坊科技学院教务管理系统</h1>
			      <span @click="login_out" class="login_out">退出</span>
		</el-header>
		<el-container>
			<el-aside width="240px">
				<el-menu
					class="el-menu"
					active-text-color="#ffd04b"
					:default-active="activeFuncKey"
					@select="menuSelectHandler">
					<template v-for="item in menuData">
						<el-menu-item v-if="item.func_key" :index="item.func_key" :key="item.func_id">
							<i class="el-icon-menu"></i>
							<span slot="title" v-text="item.func_name"></span>
						</el-menu-item>
						<el-submenu v-else :index="item.func_id.toString()" :key="item.func_id">
							<template slot="title">
								<i class="el-icon-setting"></i>
								<span v-text="item.func_name"></span>
							</template>
							<template v-if="item.children">
								<el-menu-item v-for="item2 in item.children"
								              :key="item2.func_id"
								              :index="item2.func_key">
                                                                       <i class="el-icon-menu"></i>
									<span slot="title" v-text="item2.func_name"></span>
								</el-menu-item>
							</template>
						</el-submenu>
					</template>
				</el-menu>
			</el-aside>
			<el-container class="main-container">
				<el-main>
					<el-tabs class="el-tabs"  type="border-card" @tab-remove="tabRemoveHandler" closable v-model="activeFuncKey">
						<el-tab-pane v-for="func_key in activeFuncKeys"
						  :key="func_key"
						 :label="menu.find(item => item.func_key ===func_key).func_name"
						 :name="func_key">
							<component :is="views[func_key]"></component>
						</el-tab-pane>
					</el-tabs>
				</el-main>
				<el-footer>
					版权所有&copy;2009H5全体同学 网址：www.bilibili.com
				</el-footer>
			</el-container>
		</el-container>
	      </el-container>
</template>

<script type="text/ecmascript-6">
	// 导入地图
 import views from "../../views"
      //字典导入
 import  {createNamespacedHelpers}  from "vuex";
 let  {mapActions} = createNamespacedHelpers('dictionary')

          export default {
                  name: "Home",
	          data() {
                          return {
                                  views,
                                  activeFuncKey: "student",
	                          activeFuncKeys:[],
                                  menu: [],
	                          token: sessionStorage.getItem("user_name")
                          }
	          },
	          methods: {
		              ...mapActions(['init']),
                              menuSelectHandler(index,indexPath) {
	                              this.activeFuncKey = index;
	                              if(this.activeFuncKeys.indexOf(index) === -1) {
		                              this.activeFuncKeys.push(index)
	                              }
                              },
		              tabRemoveHandler(name) {
                                      this.activeFuncKeys.splice(this.activeFuncKeys.indexOf(name),1);
                                      if(this.activeFuncKeys.indexOf(this.activeFuncKey) === -1){
                                              this.activeFuncKey = this.activeFuncKeys[0] || ""
                                      }
		              },
		              login_out() {
                                      sessionStorage.clear()
			              this.$router.replace("/login")
		              }
	          },
	          computed: {
                          menuData() {
                                  let result =[];
                                  this.menu.filter(item => item.func_fid === 0).forEach(item => {
                                          let node= Object.assign({},item);
                                          let children = this.menu.filter(item2 => item2.func_fid === item.func_id);
                                          if(children.length > 0) {
                                                  node.children =[];
                                                  children.forEach(item2 => node.children.push(Object.assign({}, item2)));
                                          }
                                          result.push(node)
                                  });
                                  return result
		          }
	          },
	          async created() {
                          this.init();
                          this.menu = await this.$http({
	                          url: "/user/getmenu",
	                          method:"post"
                          });
	          },
          };
</script>

<style scoped>
	body{
		cursor: default;
	}
         .login_out{
	         user-select: none;
         }
	.page-container{
		height: 100%;
		/*background: url(1.jpg);*/
		/*background-size: 100% 130%;*/
	}
	.el-header{
		display: flex;
		align-items: center;
		justify-content: space-between;

	}
	.el-container{
		width: 100%;
		height:100%;
	}
	.el-main{
		width:100%;
		height:100%;
		padding: 0;
	}
	.el-aside{
		border-right: 0;
		background: none;
	 }
	.el-footer{
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.el-menu{
		border-right: 0;
		background: none;
	}
	.el-tabs{
		height:100%;
		width: 100%;
	}
</style>