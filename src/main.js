import Vue from "vue";
import "./assets/css/reset.css";
import  "./assets/css/element.css";
import app from "./App.vue";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from "./router";
import http from "./utils/http";
import  store from  "./store";

Vue.use(ElementUI);
Vue.prototype.$http=http;
//创建根实例，渲染根组件
new Vue({
        el:"#app",
        components: {app},
        template: "<app />",
        router,
        store,
})