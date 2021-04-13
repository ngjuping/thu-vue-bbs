<template>
<div>
    <div class="modal fade" :id="modal_id" role="dialog">
      <div class="modal-dialog" role="document">
          <div class="modal-content">
          <div class="modal-header">
              <h5 class="modal-title">Edit post</h5>
              <button type="button" class="close" data-dismiss="modal">
              <span aria-hidden="true">&times;</span>
              </button>
          </div>
          <div class="modal-body">
              <form>
              <div class="form-group">
                  <label class="col-form-label">Title:</label>
                  <input type="text" class="form-control" v-model="title">
              </div>
              <div class="form-group">
                  <label class="col-form-label">Content:</label>
                  <textarea class="form-control" v-model="content"></textarea>
              </div>
              </form>
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary text-white" data-dismiss="modal" v-show="!submitting">Close</button>
              <button type="button" class="btn btn-primary text-white" @click = "editPost" v-show="!submitting">Edit Post</button>
              <button class="btn btn-primary" v-show="submitting" disabled>
                <span class="spinner-border spinner-border-sm"></span>
                Submitting...
                </button>
            </div>
        </div>
        </div>
    </div>
</div>
</template>

<script>
import $ from 'jquery';
import Swal from 'sweetalert2'

export default {
    name:"EditPost",
    props: ["postId","oldTitle","oldContent","launch"],
    data()
    {
        return {
            title: this.oldTitle,
            content: this.oldContent,
            submitting: false,
            modal_id: `edit_post_modal_${this.postId}`
        }
    },
    watch:
    {
        launch: function()  {
            $("#"+this.modal_id).modal('toggle');
        }
            
    },
    methods:{
        editPost()
        {
            this.submitting = true;
            this.$axios.put(
                `api/v1/post/${this.postId}`,
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

                $(`#edit_post_modal_${this.postId}`).modal('hide');
                this.$emit('reload-posts');

                this.$root.$emit('update-history-favorites',{
                    postId:this.postId,
                    title:this.title, 
                    content:this.content.slice(0,100),
                    actualContent:this.content
                });
                //reset everything
                this.submitting = false;
            })
            .catch((e) => {
                
                console.log("Edit post failed.");
                console.log(e);

                $(`#edit_post_modal_${this.postId}`).modal('hide');
                
                this.submitting = false;
                
                 Swal.fire({
                    title: "Session expired",
                    text: "Please login again.",
                    icon: "error",
                    timer: 1500});

                this.$router.replace({name:'Login'});
                    
            })
        }
    }
}
</script>