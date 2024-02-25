var roleHarvester = require('role.harvester_alpha');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleHarvester_alpha = require('./role.harvester_alpha');

module.exports.loop = function () {

    var groups = _.groupBy(Game.creeps, (c) => { return c.memory.role; });
    var sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);

    console.log(JSON.stringify(groups));

    if (!groups['harvester_alpha'] || groups['harvester_alpha'].length < 3) {
        var sourceTarget = Math.floor(Math.random() * sources.length);
        var newName = sourceTarget + 'Harvester_alpha' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: 'harvester_alpha', sourceTarget: sourceTarget}});        
    } else if (!groups['upgrader'] || groups['upgrader'].length < 1) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], newName, 
            {memory: {role: 'upgrader', upgradeAvailable: false}});        
    } else if (!groups['builder'] || groups['builder'].length < 1) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,MOVE], newName, 
            {memory: {role: 'builder'}});        
    }
    
    if (Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    var tower = Game.getObjectById('TOWER_ID');
    if (tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'harvester_alpha') {
            roleHarvester_alpha.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            if (Game.creeps.length >= 5) {
                creep.memory.upgradeAvailable = true;
                console
            } else {
                creep.memory.upgradeAvailable = false;
            }
            console.log(JSON.stringify(creep.memory));
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}