function onLoad(){
/*
    var style=document.documentElement.style;
    style.setProperty("--tt","-500px");
    document.getElementsByClassName("elevator")[0].classList.add("myMove");
*/
    oCity.addBuilding(6,3);
    oCity.addBuilding(3,1);
    oCity.dayBreak();
}
const Directions = {
    UP:1,
    DOWN:2
}
const OrderState = {
    NOT_ORDERED:1,
    ORDERED_NOT_ASSIGNED:2,
    ORDERED_AND_ASSIGNED:3
}
Elevator.prototype.create = function(eParent){
    const eElevator=document.createElement("div");
    eElevator.classList.add("elevator");
    eParent.appendChild(eElevator);
    this.eElevator=eElevator;
}
Elevator.prototype.addOrder = function(iFloorNumber){
    this.arOrders.push(iFloorNumber);
    console.log("order was made to floor number - "+iFloorNumber);
}
function Elevator(){
    this.direction=Directions.UP;
    this.iCurrentFloor=0;
    this.eElevator=null;
    this.arOrders=[];
}
ElevatorsOrchestrator.prototype.orchestrate = function(){
    for (let oElevator of this.arElevators){
//        console.log ("here i should do something, but due to the time, i have no clue as to what should be done here");
    }
}
ElevatorsOrchestrator.prototype.addOrder = function(iFloorNumber){
    //here you should write a perfect algorithm to find the most 
    // efficient (how i hat this word)
    // elevator. for now, i just choose the first victim.
    this.arElevators[0].addOrder(iFloorNumber);
}
ElevatorsOrchestrator.prototype.init = function(iElevatorsNum){
    for (let jj=0;jj<iElevatorsNum;jj++){
        this.arElevators.push(new Elevator());
    }
}
function ElevatorsOrchestrator(iElevatorsNum){
    this.arElevators=[];
    this.init(iElevatorsNum);
}
Floor.prototype.create = function(eParent){
    const eFloor=document.createElement("div"),eController=document.createElement("button");
    eFloor.classList.add("floor");
    eController.classList.add("metal","linear");
    eController.innerText=this.iFloorNumber;
    eFloor.appendChild(eController);
    eParent.appendChild(eFloor);
    this.eFloor=eFloor;

    eController.addEventListener("click",e=>{
        this.orderState=this.orderState===OrderState.NOT_ORDERED ? OrderState.ORDERED_NOT_ASSIGNED : this.orderState;
    })
}
function Floor(iFloorNumber){
    this.eFloor=null;
    this.orderState=OrderState.NOT_ORDERED;
    this.iFloorNumber=iFloorNumber;
}
function Building(iFloorsNum,iElevatorsNum){
    this.arFloors=[];
    this.eBuilding=null;
    this.oElevatorsOrchestrator=new ElevatorsOrchestrator(iElevatorsNum);
    this.init(iFloorsNum);
}
Building.prototype.coordinateElevators = function(){
    this.allocateElevators();
    this.oElevatorsOrchestrator.orchestrate();
}
Building.prototype.allocateElevators = function(){
    for (let oFloor of this.arFloors){
        if (oFloor.orderState===OrderState.ORDERED_NOT_ASSIGNED){
            oFloor.orderState=OrderState.ORDERED_AND_ASSIGNED;
            this.oElevatorsOrchestrator.addOrder(oFloor.iFloorNumber);
        }
    }
}
Building.prototype.create = function(){
    const eBuilding=document.createElement("div"),
        eFloors=document.createElement("div"),
        eElevators=document.createElement("div");
    eBuilding.classList.add("building");
    eFloors.classList.add("floors");
    eElevators.classList.add("elevators");
    eBuilding.appendChild(eFloors);
    eBuilding.appendChild(eElevators);
    document.getElementById("eCityArea").appendChild(eBuilding);
    this.eBuilding=eBuilding;

    for (let oFloor of this.arFloors){
        oFloor.create(eFloors);
    }

    for (let oElevator of this.oElevatorsOrchestrator.arElevators){
        oElevator.create(eElevators);
    }
}
Building.prototype.init = function(iFloorsNum){
    for (let jj=iFloorsNum-1;jj>=0;jj--){
        this.arFloors.push(new Floor(jj));
    }
    this.create();
}
const oCity = {
    arBuildings:[],
    addBuilding(iFloorsNum,iElevatorsNum){
        this.arBuildings.push(new Building(iFloorsNum,iElevatorsNum));
    },
    dayBreak(){
        window.setInterval(()=>{
            for (let oBuilding of this.arBuildings){
                oBuilding.coordinateElevators();
            }
        },500)
    }
}