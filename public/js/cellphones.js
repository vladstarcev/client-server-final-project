$(document).ready(function(){
  $(".phone0").on("click", function(){
    $(".models0").slideDown();
    $(".models1").hide();
    $(".models2").hide();
    $(".models3").hide();

    $(".model0").removeClass("border-danger");
    $(".model1").removeClass("border-danger");
    $(".model2").removeClass("border-danger");

    $(".credit").hide();
  });

  $(".phone1").on("click", function(){
    $(".models0").hide();
    $(".models1").slideDown();
    $(".models2").hide();
    $(".models3").hide();

    $(".model0").removeClass("border-danger");
    $(".model1").removeClass("border-danger");
    $(".model2").removeClass("border-danger");

    $(".credit").hide();
  });

  $(".phone2").on("click", function(){
    $(".models0").hide();
    $(".models1").hide();
    $(".models2").slideDown();
    $(".models3").hide();

    $(".model0").removeClass("border-danger");
    $(".model1").removeClass("border-danger");
    $(".model2").removeClass("border-danger");

    $(".credit").hide();
  });


  $(".model0").on("click", function(){
    $(".model0").addClass("border-danger");
    $(".model1").removeClass("border-danger");
    $(".model2").removeClass("border-danger");

    $(".credit").slideDown();
  });

  $(".model1").on("click", function(){
    $(".model0").removeClass("border-danger");
    $(".model1").addClass("border-danger");
    $(".model2").removeClass("border-danger");
    $(".credit").slideDown();
  });

  $(".model2").on("click", function(){
    $(".model0").removeClass("border-danger");
    $(".model1").removeClass("border-danger");
    $(".model2").addClass("border-danger");
    $(".credit").slideDown();
  });
});
