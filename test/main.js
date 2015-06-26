'use strict';

var RouteNode = require('../');
var should    = require('should');

require('mocha');

describe('RouteNode', function () {
    it('should instanciate an empty RouteNode if no routes are specified in constructor', function () {
        var node = new RouteNode();

        node.children.length.should.equal(0);
    });

    it('should instanciate a RouteNode object from plain objects', function () {
        var node = new RouteNode('', '', [
            {name: 'home', path: '/home'},
            {name: 'profile', path: '/profile'}
        ]);

        node.children.length.should.equal(2);
    });

    it('should throw an error when trying to instanciate a RouteNode object with plain objects missing `name` or `path` properties', function () {
        (function () {
            new RouteNode('', '', [
                {name: 'home'}
            ]);
        }).should.throw();

        (function () {
            new RouteNode('', '', [
                {path: '/profile'}
            ]);
        }).should.throw();
    });

    it('should throw an error when trying to add a route to a node with an already existing alias or path', function () {
        var root = new RouteNode('', '', [
            {name: 'home', path: '/home'}
        ]);

        (function () {
            root.add({name: 'home', path: '/profile'})
        }).should.throw('Alias "home" is already defined in route node');

        (function () {
            root.add({name: 'profile', path: '/home'})
        }).should.throw('Path "/home" is already defined in route node');
    });

    it('should instanciate a RouteNode object from RouteNode objects', function () {
        var node = new RouteNode('', '', [
            new RouteNode('home', '/home'),
            new RouteNode('profile', '/profile')
        ]);

        node.children.length.should.equal(2);
    });

    it('should find a nested route by name', function () {
        var node = getRoutes();

        node.getPath('home').should.equal('/home');
        node.getPath('users').should.equal('/users');
        node.getPath('users.list').should.equal('/users/list');
        node.getPath('users.view').should.equal('/users/view/:id');
    });

    it('should build the path of a nested route', function () {
        var node = getRoutes();
        // Building paths
        node.buildPath('home').should.equal('/home');
        node.buildPath('users').should.equal('/users');
        node.buildPath('users.list').should.equal('/users/list');
        node.buildPath('users.view', {id: 1}).should.equal('/users/view/1');
        // Missing parameters
        (function () {
            node.buildPath('users.view');
        }).should.throw();
    });

    it('should find a nested route by path', function () {
        var node = getRoutes();
        // Building paths
        node.matchRoute('/users/view/1').should.eql({name: 'users.view', params: {id: '1'}});
        node.matchRoute('/users/profile/1').should.be.false;
        node.matchRoute('/users/view/profile/1').should.be.false;
    });
});


function getRoutes() {
    var usersNode = new RouteNode('users', '/users', [
            new RouteNode('list', '/list'),
            new RouteNode('view', '/view/:id')
        ])

    return new RouteNode('', '', [
        new RouteNode('home', '/home'),
        usersNode
    ]);
}
