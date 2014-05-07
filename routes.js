Router.configure({
  layoutTemplate: "layout"
});

Router.map(function () {
  this.route("admin");
  this.route("survey", {
    path: "/"
  });

  this.route("response", {
    path: "/response/:_id",
    data: function () {
      return Responses.findOne({_id: this.params._id});
    }
  });
});