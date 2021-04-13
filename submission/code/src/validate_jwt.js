import Swal from 'sweetalert2';
import router from './router'
import axios from 'axios';

export default{
    validate:()=>{
        let jwt = localStorage.getItem('my-jwt');
        if(jwt)
        {
            return axios
            .get('/api/v1/user', {headers: {
              Authorization: jwt,
              }})
            .then((res) => {
                return res.data;
            })
            .catch((e)=>{
                Swal.fire({
                    title: "Token error",
                    text: "Session expired, please log in again.",
                    icon: "warning",
                    timer: 1500});
                router.replace({name:'Login'});
                return e;
            });
        }
        else
        {
            Swal.fire({
                title: "No token",
                text: "Sorry, please log in again.",
                icon: "warning",
                timer: 1500});
                router.replace({name:'Login'});

            return 0;
        }
    }
}