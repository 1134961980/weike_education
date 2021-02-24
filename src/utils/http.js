import { Loading, MessageBox} from "element-ui";
import axios from 'axios';
import {router} from 'vue-router';

let loadingIntance = null;
let  loadingCount = 0;  //记录ajax的数量
let alwaysPendingPromise = new Promise(() => {});

export default function(userOptions) {
        let defaultOptions = {
                method: "get",
                headers: {
                        "Content-Type": "application/json",
                        "Authorization": sessionStorage.getItem("token")
                }
        };
        let options = Object.assign({}, defaultOptions, userOptions);
        if(options.data) options.data = JSON.stringify(options.data);
            loadingCount++;
        loadingIntance =  Loading.service({text: "loading..."})
        return axios(options)
                .then(response => {
                        if(response.status === 200) {
                                switch(response.data.status) {
                                        case 200:
                                               loadingCount-- === 1 &&  loadingIntance.close(); // 关闭loading效果
                                                return response.data.data;
                                        case 401:
                                                loadingCount-- === 1 &&  loadingIntance.close(); // 关闭loading效果
                                                sessionStorage.clear();
                                                MessageBox.alert("登录超时请重新登录！", "提示", { type: warning, showClose: false});
                                                router.replace("/login");
                                                return alwaysPendingPromise;
                                        case 199:
                                        case 404:
                                        case 500:
                                                throw new Error(response.data.message);
                                }
                        }
                })
                .catch(error => {
                        // 不管前面哪里错了，到我这里我希望收到一个错误对象，携带相关的错误信息，
                        // 我弹出来给用户看！！我兜底
                        loadingCount-- === 1 &&  loadingIntance.close(); // 关闭loading效果
                        MessageBox.alert(error.message,'提示',{type: "warning"})
                        return alwaysPendingPromise; // 返回一个永远是pending的promise不要让后面的then执行
                });
};