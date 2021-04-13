<template>
  <div>
    <form>

      <div class="form-group">
        <label >User ID</label>
        <input class="form-control" :disabled="logging_in" v-model="d_username" :required="d_username===''">
        <small class="form-text text-muted">Glad to see you back {{d_username}}</small>
      </div>

      <div class="form-group">
        <label >Password</label>
        <input type="password" class="form-control" required :disabled="logging_in" v-model="d_password">
      </div>
      
      <button type="submit" class="btn btn-primary text-white" @click.prevent="login" v-show="!logging_in" autofocus>Submit</button>
      
      <button class="btn btn-primary" v-show="logging_in" disabled>
      <span class="spinner-border spinner-border-sm"></span>
      Loggin in...
      </button>
    </form>
  </div>
  
</template>

<script>
import Swal from 'sweetalert2'
import validate_jwt from '../validate_jwt.js'

export default {
  name: "LoginForm",
  props: {
    msg: String
  },
  data(){
    return {
      d_username: "2018080120",
      d_password: "365391",
      logging_in: false
    };
  },

  async mounted()
  {
      let data = await validate_jwt.validate();
      if(data.nickname === localStorage.getItem('my-nickname'))
      {
        this.$router.replace({name:'Welcome'});
        Swal.fire({
          title: "Welcome! " + data.nickname,
          text: "You have been logged in.",
          icon: "success",
          timer: 1000}
        );
      }
  },

  methods:
  {
    login()
    {
      this.logging_in = true;
      this.$axios
      .patch('/api/v1/login',{
          username: this.d_username,
          password: this.d_password
        }
      )
      .then(res => 
      {
        this.$router.push({name:'Welcome'});
        this.logging_in = false;
        let data = res.data
        Swal.fire({
          title: "Welcome! " + data.nickname,
          text: "You have been logged in.",
          icon: "success",
          timer: 1000}
        );

        localStorage.setItem('my-jwt',data.jwt);
        localStorage.setItem('my-nickname',data.nickname);
        localStorage.setItem('my-id',data.userId);
        

      })
      .catch(()=>{
        this.logging_in = false;
        Swal.fire({
          title: "Wrong credentials",
          text: "Please check your details carefully",
          icon: "error",
          timer: 1500});
        
        });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  form{
    padding:20px;
  }
</style>
