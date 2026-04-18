package com.unilifehub.socialservice.dto.response;

import java.time.LocalDateTime;

public class GroupPostResponse {

    private Long id;
    private Long groupId;
    private Long postId;
    private Long postedBy;
    private LocalDateTime postedAt;

    public GroupPostResponse() {}

    public GroupPostResponse(Long id, Long groupId, Long postId,
                             Long postedBy, LocalDateTime postedAt) {
        this.id = id;
        this.groupId = groupId;
        this.postId = postId;
        this.postedBy = postedBy;
        this.postedAt = postedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public Long getPostedBy() { return postedBy; }
    public void setPostedBy(Long postedBy) { this.postedBy = postedBy; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
}