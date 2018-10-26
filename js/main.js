function onLoad(){
    oCity.addBuilding(15,3);
    oCity.addBuilding(20,6);
}
const Directions = {
    UP:1,
    DOWN:2
}

function Elevator(){
    this.direction=Directions.UP;
}

function ElevatorsOrchestrator(iElevatorsNum){
    this.arElevators=[];
    this.init(iElevatorsNum);
}
ElevatorsOrchestrator.prototype.init = function(iElevatorsNum){
    for (let jj=0;jj<iElevatorsNum;jj++){
        this.arElevators.push(new Elevator());
    }
    console.log ("num of elevators are - "+this.arElevators.length);
}
function Floor(iFloorNumber){
    this.iFloorNumber=iFloorNumber;
}
function Building(iFloorsNum,iElevatorsNum){
    this.arFloors=[];
    this.oElevatorsOrchestrator=new ElevatorsOrchestrator(iElevatorsNum);
    this.init(iFloorsNum);
}
Building.prototype.init = function(iFloorsNum){
    for (let jj=0;jj<iFloorsNum;jj++){
        this.arFloors.push(new Floor(jj));
    }
    console.log ("num of floors are - "+this.arFloors.length);
}
const oCity = {
    arBuildings:[],
    addBuilding(iFloorsNum,iElevatorsNum){
        this.arBuildings.push(new Building(iFloorsNum,iElevatorsNum));
    },
    dayBreak(){
        console.log("let the games begin");
    }
}