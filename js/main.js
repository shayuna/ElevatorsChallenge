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
    NONE:0,
    UP:1,
    DOWN:2,
}
const OrderState = {
    NOT_ORDERED:1,
    ORDERED_NOT_ASSIGNED:2,
    ORDERED_AND_ASSIGNED:3
}
function ElevatorMovementCoordinator(eElevator){
    this.iFrom=0;
    this.iTo=0;
    this.iFramesPerSecond=60;
    this.iFramesPerSecondInterval=this.iFramesPerSecond/1000;
    this.iFloorHeight=110;
    this.iNumOfSecondsBetweenAdjacentFloors=0.5;
    this.iTotalNumOfSeconds=0;
    this.iStartTimeStamp=null;
    this.iLastTimeStamp=null;
    this.eElevator=eElevator;
    this.iTotalDistanceToCover=0;
    this.iDistanceOnEachIteration=0;
}
ElevatorMovementCoordinator.prototype.move = function(iFrom,iTo){
    this.iFrom=iFrom;
    this.iTo=iTo;
    this.iTotalNumOfSeconds=Math.abs(iTo-iFrom)*this.iNumOfSecondsBetweenAdjacentFloors;
    this.iTotalDistanceToCover=Math.abs(iTo-iFrom)*this.iFloorHeight;
    this.iDistanceOnEachIteration=this.iTotalDistanceToCover/this.iTotalNumOfSeconds/this.iFramesPerSecond*(this.iTo>this.iFrom ? -1 : 1);
    this.iLastTimeStamp=null;
    this.iStartTimeStamp=Date.now();
    this.startAnimating();
}
ElevatorMovementCoordinator.prototype.startAnimating=function(){

    // calc elapsed time since last loop
    if (!this.iLastTimeStamp)this.iLastTimeStamp=Date.now();
    const iNow = Date.now(),iElapsed = iNow - this.iLastTimeStamp;
    // if allocated time elapsed then exit 
    if ((this.iLastTimeStamp-this.iStartTimeStamp)/1000<this.iTotalNumOfSeconds)requestAnimationFrame(()=>this.startAnimating());
    
    // if enough time has elapsed, draw the next frame
    if (iElapsed > this.iFramesPerSecondInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        this.iLastTimeStamp = iNow - (iElapsed % this.iFramesPerSecondInterval);

        // Put your drawing code here
        if (isNaN(parseFloat(this.eElevator.style.top)))this.eElevator.style.top="0";
		this.eElevator.style.top=parseFloat(this.eElevator.style.top)+this.iDistanceOnEachIteration+"px";
    }
}

Elevator.prototype.create = function(eParent){
    const eElevator=document.createElement("div");
    eElevator.classList.add("elevator");
    eParent.appendChild(eElevator);
    this.eElevator=eElevator;
    this.oElevatorMovementCoordinator= new ElevatorMovementCoordinator(eElevator);
}
Elevator.prototype.addOrder = function(iFloorNum){
    this.arOrders.push(iFloorNum);
    console.log("order was made to floor number - "+iFloorNum);
    }
Elevator.prototype.recalcState = function(){
    if (this.iDelayState>0){
        this.iDelayState--;
        console.log ("in delay state in floor num - "+this.iCurrentFloor);
    }
    else if (this.iCurrentFloor===this.arOrders[0]){
        this.oFloorsManager.arFloors[this.arOrders[0]].orderState=OrderState.NOT_ORDERED;
        this.arOrders.splice(0,1);
        this.iDelayState=4;
        console.log ("reached floor no - "+this.iCurrentFloor);
        this.direction=Directions.NONE;
        
        //should make a sound
        //should stay in floor. how can we accomplish that ?
    }
    else if (this.arOrders.length>0){
        if (this.direction===Directions.NONE)this.oElevatorMovementCoordinator.move(this.iCurrentFloor,this.arOrders[0]);

        this.direction=this.arOrders[0]-this.iCurrentFloor>0 ? Directions.UP : Directions.DOWN;
        this.iCurrentFloor+=this.direction===Directions.UP ? 1 : -1;
    }
}
function Elevator(oFloorsManager){
    this.direction=Directions.NONE;
    this.iCurrentFloor=0;
    this.eElevator=null;
    this.arOrders=[];
    this.iDelayState=0;
    this.oFloorsManager=oFloorsManager;
    this.oElevatorMovementCoordinator= null;
}
ElevatorsOrchestrator.prototype.orchestrate = function(){
    for (let oElevator of this.arElevators){
            oElevator.recalcState();
    }
}
ElevatorsOrchestrator.prototype.addOrder = function(iFloorNum){
    //here you should write a perfect algorithm to find the most 
    // efficient (how i hat this word)
    // elevator. for now, i just choose the first victim.
    this.arElevators[0].addOrder(iFloorNum);
}
ElevatorsOrchestrator.prototype.create = function(oFloorsManager,eFloors){
    for (let jj=0;jj<this.iElevatorsNum;jj++){
        const oElevator=new Elevator(oFloorsManager);
        oElevator.create(eFloors);
        this.arElevators.push(oElevator);
    }
}
function ElevatorsOrchestrator(iElevatorsNum){
    this.iElevatorsNum=iElevatorsNum;
    this.arElevators=[];
}
function FloorsManager(iFloorsNum){
    this.arFloors=[];
    this.iFloorsNum=iFloorsNum;
}
FloorsManager.prototype.create = function(oElevatorsOrchestrator,eFloors){
    for (let jj=0;jj<this.iFloorsNum;jj++){
        const oFloor=new Floor(jj,oElevatorsOrchestrator);
        oFloor.create(eFloors);
        this.arFloors.push(oFloor);
    }
}

Floor.prototype.create = function(eParent){
    const eFloor=document.createElement("div"),eController=document.createElement("button");
    eFloor.classList.add("floor");
    eController.classList.add("metal","linear");
    eController.innerText=this.iFloorNum;
    eFloor.appendChild(eController);
    if (eParent.childNodes.length===0){
        eParent.appendChild(eFloor);
    }else{
        eParent.insertBefore(eFloor,eParent.childNodes[0]);
    }
    this.eFloor=eFloor;

    eController.addEventListener("click",e=>{
        if (this.orderState===OrderState.NOT_ORDERED){
            this.orderState=OrderState.ORDERED_NOT_ASSIGNED;
            this.oElevatorsOrchestrator.addOrder(this.iFloorNum);
        }
    })
}
function Floor(iFloorNum,oElevatorsOrchestrator){
    this.eFloor=null;
    this.orderState=OrderState.NOT_ORDERED;
    this.iFloorNum=iFloorNum;
    this.oElevatorsOrchestrator=oElevatorsOrchestrator;
}
function Building(iFloorsNum,iElevatorsNum){
    this.eBuilding=null;
    this.oElevatorsOrchestrator=new ElevatorsOrchestrator(iElevatorsNum);
    this.oFloorsManager = new FloorsManager(iFloorsNum);
    this.init(iFloorsNum,iElevatorsNum);
}
Building.prototype.coordinateElevators = function(){
    this.oElevatorsOrchestrator.orchestrate();
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
    
    this.oFloorsManager.create(this.oElevatorsOrchestrator,eFloors);
    this.oElevatorsOrchestrator.create(this.oFloorsManager,eElevators)
}
Building.prototype.init = function(iFloorsNum){
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