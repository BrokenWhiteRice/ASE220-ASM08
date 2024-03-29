$(document).ready(function () {
  var blobId = "1214024748861612032";
  var blobUrl = `https://jsonblob.com/api/jsonBlob/${blobId}`;
  var pageSize = 2;
  var currentPage = 1;

  function fetchItems() {
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = startIndex + pageSize;
    $.ajax({
      url: blobUrl,
      method: "GET",
      success: function (response) {
        renderItems(response.slice(startIndex, endIndex));
      },
      error: function (xhr, status, error) {
        console.error("Error fetching items:", error);
      },
    });
  }

  // items on the page
  function renderItems(items) {
    var itemsList = $("#items-list");
    itemsList.empty();
    items.forEach(function (item) {
      var profileImageUrl = item.profileImageUrl
        ? item.profileImageUrl
        : "https://via.placeholder.com/50";
      var mainImageUrl = item.mainImageUrl
        ? item.mainImageUrl
        : "https://via.placeholder.com/500x500";
      var itemCard = `
                <div class="item-card" id="${item.id}">
                  <div class="item-card-header">
                    <img class="profile-picture" src="${profileImageUrl}" alt="Profile Picture">
                    <div class="user-info">
                      <strong>${item.name ? item.name : "Unknown"}</strong>
                      <p>${item.email ? item.email : "No Email"} | ${
        item.location ? item.location : "No Location"
      }</p>
                    </div>
                  </div>
                  <div class="item-card-body">
                    <img class="item-image" src="${mainImageUrl}" alt="Item Image">
                    <div class="comments">
                      ${renderComments(item.comments)}
                    </div>
                    <input type="text" class="form-control comment-input" placeholder="Add a comment...">
                  </div>
                  <div class="item-actions">
                    <i class="fas fa-heart heart-icon"></i>
                    <div class="ml-auto">
                      <button class="btn btn-primary btn-comment">Comment</button>
                      <button class="btn btn-danger btn-delete">Delete</button>
                      <button class="btn btn-info btn-edit">Edit</button>
                    </div>
                  </div>
                </div>`;
      itemsList.append(itemCard);
    });
  }

  // comments
  function renderComments(comments) {
    var html = "";
    comments.forEach(function (comment) {
      html += `<div class="comment">${comment}</div>`;
    });
    return html;
  }

  fetchItems();

  // form submission
  $("#create-form").submit(function (event) {
    event.preventDefault();
    var itemName = $("#name").val();
    var itemProfileImage = $("#profile-image").val();
    var itemMainImage = $("#main-image").val();
    var itemEmail = $("#email").val();
    var itemLocation = $("#location").val();
    var newItem = {
      id: Date.now(), // Generate id
      name: itemName,
      profileImageUrl: itemProfileImage,
      mainImageUrl: itemMainImage,
      email: itemEmail,
      location: itemLocation,
      comments: [],
    };
    $.ajax({
      url: blobUrl,
      method: "GET",
      success: function (response) {
        var items = response || [];
        items.push(newItem);
        $.ajax({
          url: blobUrl,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify(items),
          success: function (response) {
            console.log("Item created successfully:", response);
            fetchItems();
            $("#create-form")[0].reset();
          },
          error: function (xhr, status, error) {
            console.error("Error updating items:", error);
          },
        });
      },
      error: function (xhr, status, error) {
        console.error("Error fetching items:", error);
      },
    });
  });

  //  previous page
  $("#prev-page").click(function () {
    if (currentPage > 1) {
      currentPage--;
      fetchItems();
    }
  });

  //  next page
  $("#next-page").click(function () {
    currentPage++;
    fetchItems();
  });

  //  comment added
  $(document).on("click", ".btn-comment", function () {
    var itemId = $(this).closest(".item-card").attr("id");
    var commentInput = $(this).closest(".item-card").find(".comment-input");
    var comment = commentInput.val();
    if (comment.trim() !== "") {
      $.ajax({
        url: blobUrl,
        method: "GET",
        success: function (response) {
          var items = response || [];
          items.forEach(function (item) {
            if (item.id.toString() === itemId) {
              item.comments.push(comment);
            }
          });
          $.ajax({
            url: blobUrl,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(items),
            success: function (response) {
              console.log("Comment added successfully:", response);
              fetchItems();
            },
            error: function (xhr, status, error) {
              console.error("Error updating items:", error);
            },
          });
        },
        error: function (xhr, status, error) {
          console.error("Error fetching items:", error);
        },
      });
    }
    commentInput.val("");
  });
  // liking a post
  $(document).on("click", ".heart-icon", function () {
    $(this).toggleClass("clicked");
  });
  //  deleting a post
  $(document).on("click", ".btn-delete", function () {
    var itemId = $(this).closest(".item-card").attr("id");
    $.ajax({
      url: blobUrl,
      method: "GET",
      success: function (response) {
        var items = response || [];
        var filteredItems = items.filter(function (item) {
          return item.id.toString() !== itemId;
        });
        $.ajax({
          url: blobUrl,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify(filteredItems),
          success: function (response) {
            console.log("Item deleted successfully:", response);
            fetchItems();
          },
          error: function (xhr, status, error) {
            console.error("Error updating items:", error);
          },
        });
      },
      error: function (xhr, status, error) {
        console.error("Error fetching items:", error);
      },
    });
  });

  // editing a post
  $(document).on("click", ".btn-edit", function () {
    var itemId = $(this).closest(".item-card").attr("id");
    var newName = prompt("Enter new name:");
    if (newName) {
      $.ajax({
        url: blobUrl,
        method: "GET",
        success: function (response) {
          var items = response || [];
          items.forEach(function (item) {
            if (item.id.toString() === itemId) {
              item.name = newName;
            }
          });
          $.ajax({
            url: blobUrl,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(items),
            success: function (response) {
              console.log("Item edited successfully:", response);
              fetchItems();
            },
            error: function (xhr, status, error) {
              console.error("Error updating items:", error);
            },
          });
        },
        error: function (xhr, status, error) {
          console.error("Error fetching items:", error);
        },
      });
    }
  });
});
