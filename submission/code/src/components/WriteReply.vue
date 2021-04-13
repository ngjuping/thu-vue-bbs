<template>
    <div class="modal fade" id="create_reply_modal" role="dialog">
      <div class="modal-dialog" role="document">
          <div class="modal-content">
          <div class="modal-header">
              <h5 class="modal-title">New Reply</h5>
              <button type="button" class="close" data-dismiss="modal">
              <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body text-left">
              <div class="form-group">
                  <label class="col-form-label">Content:</label>
                  <textarea class="form-control" v-model="content" :disabled="submitting">
                      
                  </textarea>
              </div>
              <div class="input-group mb-3" v-if="add_pic">
                    <input type="text" class="form-control" placeholder="Picture's url" v-model="picUrl">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" @click="appendPicUrl" type="button">Add pics!</button>
                    </div>
                </div>
                <div class="btn-group mb-4" role="group" v-if="add_emojis">
                    <button type="button" class="btn btn-light" v-for="emoji in emojis" :key="emoji" @click="appendEmoji(emoji)" v-html="emoji"></button>
                </div>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle text-white" type="button" id="dropdownMenuButton" data-toggle="dropdown">
                        More
                    </button>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" @click="add_pic = !add_pic">Add picture</a>
                        <a class="dropdown-item" @click="add_emojis = !add_emojis">Add emoji</a>
                        
                    </div>
                </div>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-primary text-white" @click = "createReply" v-show="!submitting">Reply now</button>
              <button class="btn btn-primary" v-show="submitting" disabled>
                <span class="spinner-border spinner-border-sm"></span>
                Submitting...
                </button>
                
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import Swal from 'sweetalert2'

export default {
    name:"WriteReply",
    props:["postId",'replyToID'],
    data()
    {
        return {
            submitting: false,
            content: "",
            add_pic:false,
            add_emojis:false,
            picUrl:'',
            emojis:['&#128512;','&#128513;','&#128514;','&#128515;','&#128517;','&#128520;','&#128526;','&#128534;'],
        }
    },
    mounted()
    {
        $('#create_reply_modal').on('hide.bs.modal', ()=>{
            this.$emit('reload-replies');
            this.add_pic = false;
            this.add_emojis = false;
        })
    },
    methods:{
        createReply()
        {
            this.submitting = true;
            this.$axios.post(
                `/api/v1/post/${this.postId}/reply`,
                {
                    replyId: parseInt(this.replyToID),
                    content: this.content
                },
                {
                    headers: {
                    Authorization: localStorage.getItem('my-jwt'),
                    },
                }
            )
            .then(() => {

                //successfully replied
                this.submitting = false;
                $("#create_reply_modal").modal('hide');
                this.$emit("reply-created");
                //clear content textfield
                this.content = '';
                

            })
            .catch((e) => {
                console.log("Reply failed.");
                console.log(e);
                
                this.submitting = false;
                $("#create_reply_modal").modal('hide');

                 Swal.fire({
                    title: "Session expired",
                    text: "Please login again.",
                    icon: "error",
                    timer: 1500});
                    
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
        }
    }
}
</script>