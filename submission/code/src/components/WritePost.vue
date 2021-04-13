<template>
<div>
    <div class="modal fade" id="create_post_modal" role="dialog">
      <div class="modal-dialog" role="document">
          <div class="modal-content">
          <div class="modal-header">
              <h5 class="modal-title">New post</h5>
              <button type="button" class="close" data-dismiss="modal">
              <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <form>
              <div class="form-group">
                  <label class="col-form-label">Title:</label>
                  <input type="text" class="form-control" v-model="title">
                  <div class="btn-group mt-3 mb-4" role="group">
                    <button type="button" class="btn btn-light" v-for="emoji in emojis" :key="'title'+emoji" @click="appendEmojiTitle(emoji)" v-html="emoji"></button>
                  </div>
              </div>
              <div class="form-group">
                  <label class="col-form-label">Content:</label>
                  <textarea class="form-control" v-model="content"></textarea>
                  <div class="btn-group mt-3 mb-4" role="group">
                    <button type="button" class="btn btn-light" v-for="emoji in emojis" :key="'content'+emoji" @click="appendEmoji(emoji)" v-html="emoji"></button>
                  </div>
              </div>
              <div class="input-group mb-3" v-if="add_pic">
                    <input type="text" class="form-control" placeholder="Picture's url" v-model="picUrl">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" @click="appendPicUrl" type="button">Add pics!</button>
                    </div>
                </div>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle text-white" type="button" data-toggle="dropdown">
                        More
                    </button>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" @click="add_pic = !add_pic">Add external picture</a>
                        
                    </div>
                </div>
              </form>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary text-white" data-dismiss="modal" v-show="!submitting">Close</button>
              <button type="button" class="btn btn-primary text-white" @click = "createPost" v-show="!submitting">Create Post</button>
              <button class="btn btn-primary" v-show="submitting" disabled>
                <span class="spinner-border spinner-border-sm"></span>
                Submitting...
                </button>
            </div>
        </div>
        </div>
    </div>
    <button type="button" id="write_post" class="btn btn-light" data-toggle="modal" data-target="#create_post_modal">
    +
    </button>
</div>
</template>

<script>
import $ from 'jquery';
import Swal from 'sweetalert2'

export default {
    name: 'WritePost',
    data()
    {
        return{
            title: '',
            content: '',
            submitting: false,
            add_pic:false,
            add_emojis:false,
            picUrl:'',
            emojis:['&#128512;','&#128513;','&#128514;','&#128515;','&#128517;','&#128520;','&#128526;','&#128534;'],
        }
    },

    mounted()
    {
        $('#create_post_modal').on('hide.bs.modal', ()=>{
            this.$emit('reload-posts');
        })
    },

    methods:{
        createPost()
        {
            this.submitting = true;
            this.$axios.post(
                'api/v1/post',
                {
                    title: this.title,
                    content: this.content
                },
                {
                    headers: {
                    Authorization: localStorage.getItem('my-jwt'),
                    },
                }
            )
            .then(() => {
                $("#create_post_modal").modal('hide');

                //reset everything
                this.submitting = false;
                this.title = '';
                this.content = '';
            })
            .catch((e) => {
                console.log("Post failed.");
                console.log(e);
                $("#create_post_modal").modal('hide');
                this.submitting = false;
                
                 Swal.fire({
                    title: "Session expired",
                    text: "Please login again.",
                    icon: "error",
                    timer: 1500});

                this.$router.replace({name:'Login'});
                    
            })
        },
        appendPicUrl()
        {
            if(this.picUrl.length > 0)
            {
                this.content += '<br/><img src=\'' + this.picUrl + "'>";
            }
            else
            {
                console.log("url not valid");
            }
            
        },
        appendEmoji(emoji)
        {
            this.content += emoji;
        },
        appendEmojiTitle(emoji)
        {
            this.title += emoji;
        }
    }
}
</script>

<style scoped>


#write_post
{
    color:black;
    position:fixed;
    width:100px;
    height:100px;
    display:grid;
    place-items: center;
    right:30px;
    bottom:30px;
    border:2px solid #d3d3d3;
    background-color:white;
    border-radius:50%;  
    font-size:40px;
}

#write_post:hover
{
  cursor:pointer;
  background-color:#aeaeae;
  color:white;
  
}

@media(max-width:768px)
{
    #write_post
    {
        width:70px;
        height:70px;
        font-size:30px;
    }
}
</style>
