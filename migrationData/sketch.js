var migration;
var migrationData = {};
var value;
var sel;
var SVGdata;
var buttons;
var clicked;
var selected;
var idToName = {};
var countries = [];
var isOverCircle;
var maxMigration = 0
var selectedX
var selectedY
var clickedX
var clickedY
var target
var bg
var restartButton

var flocks = []
var flock

var selectionString = "SELECT A COUNTRY TO MIGRATE FROM"

function cleanSpaces(str) {
  cleanStr = str.replace(/\s/g, '');
  return cleanStr
}

function preload() {
  migration = loadTable("data/EditedDataSet/total_out.csv", "csv", "header");
  lat_long = loadTable("data/EditedDataSet/lat_long.csv", "csv", "header");
}


function setup() {
  
  getMigrationData();
  //print (idToName)
  
 // background(245, 241, 227);
  background(225, 246, 247);
  bg = loadImage("images/grid.png");
  var myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.position(0, 0);

  for (var r = 0; r < lat_long.getRowCount(); r++){
      countryName = lat_long.getString(r, "NAME")
      if (countryName in migrationData) {
        countries.push(new Country(lat_long.getString(r, "ID"), lat_long.getString(r, "NAME"), lat_long.getNum(r, "LAT"), lat_long.getNum(r, "LONG"), 0))
      }
  }
  
  flock = new Flock();
  
  restartButton = new Button("RESET", 30, 30)

  
}


function getMigrationData() {
    for (var r = 0; r < migration.getRowCount(); r++){
    var nameId = migration.getString(r, "NAMEID"); //out country id
    var homeCountry = migration.getString(r, "Birth"); //out country
    var idDestination = cleanSpaces(migration.getString(r, "COU")); //destination country id
    var destinationCountryName = migration.getString(r, "Country"); //destination country
    var value = migration.getNum(r, "Value")
    if (!migrationData[homeCountry]) {
      migrationData[homeCountry] = {}
    }
    migrationData[homeCountry][destinationCountryName] = value
    if (value>maxMigration) {
      maxMigration = value
    }
  }
}

function draw(){
  background(245, 241, 227);
  //background(bg)
  image(bg, 0, 0);
  
  push();
  textAlign(CENTER)
  textSize(20);
  textStyle(BOLD)
  textFont("Futura")
  fill(60);
  text(selectionString, width/2, 70)
  pop();
  
  tooltip();
  
  if (selected) {
    restartButton.show()
  }
  

  if (clicked) {
    flock.runToTarget(target)
  }
  // for (var i=0; i<flocks.length; i++) {
  //   flocks[i].run();
  // }

  if (selected && clicked){
    drawLines()

  }

  mouseOver=false
  countries.forEach(function(country, idx, array) {
    if (selected) {
      if (country.name in migrationData[selected] || country.name==selected) {
        country.display()
      }
    }
    else {
      country.display()
    }
    country.c = color(100);
    country.resetRadius()
    if (country.name==selected) {
      country.c = color(247, 211, 0);
      country.radius = 40
    }
    if (country.name==clicked) {
      country.c = 'red'
      country.radius = 20
    }
    if (country.mouseOver()) {
      country.radius = 20
      country.c = color(200, 200, 255)
      country.showName()
      mouseOver = true
    }
  });
  
  if (selected && restartButton.containsCursor()) {
    mouseOver = true
  }
  if (mouseOver) {
    cursor(HAND);
  }
  else {
    cursor(ARROW);
  }
  
}

function drawLines() {
  if (!clicked in migrationData[selected]) {
    return
  }
  push();
  fill(0)
  textAlign(CENTER)
  textFont("Futura");
  if(migrationData[selected][clicked] == 1){
     text (migrationData[selected][clicked] + " person migrated from " + selected + " to " + clicked + " in 2012 ", width/2, 120)
  }
  else{
     text (migrationData[selected][clicked] + " people migrated from " + selected + " to " + clicked + " in 2012 ", width/2, 120)
  }
  pop();

}


function Country (id, name, lat, long, c) {
  this.id = id;
  this.name = name;
  this.lat = lat;
  this.long = long;
  this.radius = 6;
  this.x = this.long*3+width/2
  this.y =-this.lat*3+height/2+50
  this.c = c
  
this.resetRadius = function() {
  this.radius = 8;
}
 
this.display = function(){
  push();
  ellipseMode(CENTER)
  //translate (width/2, height/3)
  //stroke(0);
  noStroke();
  fill(color(this.c));
  // ellipse(map(this.long, -110, 110, -400, 400), map(this.lat,  -110, 110, -400, 400), this.radius, this.radius)
  // text(this.name,map(this.long, -110, 110, -400, 400), map(this.lat,  -110, 110, -400, 400))
  ellipse(this.x, this.y, this.radius, this.radius)
  
  pop();
}

this.containsCursor = function(x,y){
  return sq((x - this.x) / this.radius) + sq((y - this.y) / this.radius) < 0.25;
}

this.mouseOver = function() {
  return this.containsCursor(mouseX, mouseY)
}

this.showName = function() {
  push()
  fill(0)
  noStroke()
  textFont("Futura");
  textSize(15);
  text(this.name, this.x+10,this.y-15)
  pop()
}
}

function tooltip(){
  // push()
  noFill();
  stroke(1);
  strokeWeight(2);
  line(0, mouseY, width, mouseY);
  line(mouseX, 0, mouseX, height);

  tooltip
  noStroke();
  fill(1);
  text(mouseX + " x, " + mouseY + " y", mouseX + 10, mouseY + 15);
  //pop()
  
}



function Button (string, x, y) {
  this.string =  string
  this.size = 12
  this.wide = 0
  this.x = x
  this.y = y
  
  this.show = function() {
    push();
    textAlign(LEFT, TOP);
    textSize(this.size)
    text(this.string, x, y)
    fill(160)
    this.wide = textWidth(this.string)
    pop();
  }
  this.containsCursor = function() {
    bul = mouseX>this.x && mouseX<this.x+this.wide && mouseY>this.y && mouseY<this.y+this.size
    print (bul)
    print (this.x+" "+this.wide+" "+this.y+" "+this.size+" "+mouseX+" "+mouseY)
    return (mouseX>this.x && mouseX<this.x+this.wide && mouseY>this.y && mouseY<this.y+this.size)
  }
}
function mouseClicked(){
  x= mouseX
  y= mouseY
  if (selected && restartButton.containsCursor()) {
    selected=false
    clicked = false
    return
  }
  countries.forEach(function(country, idx, array) {
    if (country.containsCursor(x,y)) {
      if(!selected) {
        //var item = sel.value();
        selected = country.name
        selectedX = country.x
        selectedY = country.y
        flock = new Flock();
        
        selectionString = "SELECT A COUNTRY TO MIGRATE TO"
      }
      else {
      clicked = country.name
      clickedX = country.x
      clickedY = country.y
       
        
      flock = new Flock();
        // Add an initial set of boids into the system
      target = createVector(clickedX, clickedY);
      var migrationNumber = migrationData[selected][clicked]
      var numOfBoids = 0
      if (migrationNumber < 30) {
       numOfBoids = migrationNumber //map(migrationNumber, 1, 5000, 5, 200)
      }
      else {
        numOfBoids = map(migrationNumber, 30, 5000, 30, 150)
      }
      for (var i = 0; i < numOfBoids; i++) {
        var b = new Boid(selectedX,selectedY);
        flock.addBoid(b);
        
      }
      //flocks.push(flock)
      print (country.name)
      return;
    }
    }
  });
}


////////////////.........\\\\\\\\\\\\\\\\\


