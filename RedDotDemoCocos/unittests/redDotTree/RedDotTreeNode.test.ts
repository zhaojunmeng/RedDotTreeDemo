import { RedDotTreeNode } from "../../assets/scripts/thirdParty/redDotTree/RedDotTreeNode";

describe('RedDotTreeNode', () => {
    beforeEach(() => {
        // disable console.error()
        RedDotTreeNode.errorFucntion = null;
    });

    describe("Add Node", () => {
        test('Add one level child', () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            expect(newNode).toBeTruthy();
            expect(newNode.name).toEqual("level1");
        });
    
        test('Add two level child', () => {
            let rootNode = new RedDotTreeNode("", true);
            rootNode.addNode("level1", true);
            let newNode = rootNode.addNode("level1/level2", true);
            expect(newNode).toBeTruthy();
            expect(newNode.name).toEqual("level2");
        });
        
        test('Add two level child without add level1 will fail', () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1/level2", true);
            expect(newNode).toBeNull();
        });
        
        test('Add the same child will fail', () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode1 = rootNode.addNode("level1", true);
            expect(newNode1).toBeTruthy();
            let newNode2 = rootNode.addNode("level1", true);
            expect(newNode2).toBeNull();
        });
    });

    describe("Get Node", () => {
        test('Get one level child', () => {
            let rootNode = new RedDotTreeNode("", true);
            rootNode.addNode("level1", true);
            let newNode = rootNode.getNode("level1");
            expect(newNode).toBeTruthy();
            expect(newNode.name).toEqual("level1");
        });
        
        test('Get two level child', () => {
            let rootNode = new RedDotTreeNode("", true);
            rootNode.addNode("level1", true);
            rootNode.addNode("level1/level2", true);
            let newNode = rootNode.getNode("level1/level2");
            expect(newNode).toBeTruthy();
            expect(newNode.name).toEqual("level2");
        });
        
        test('Get a non exist child will fail', () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.getNode("level1");
            expect(newNode).toBeNull();
        });
    });

    describe("RedNum", () => {
        test("RedNum is zero when node added", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            expect(newNode.redNum).toBe(0);
        });
        
        test("Can't change non leaf node redNum directly", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            expect(newNode.redNum).toBe(0);
            rootNode.addNode("level1/level2", true);
            newNode.redNum = 2;
            expect(newNode.redNum).toBe(0);
        });
        
        test("isNum(true): parent renNum is sum of children's redNum", () => {
            let rootNode = new RedDotTreeNode("", true);
            let parentNode = rootNode.addNode("parent", true);
            expect(parentNode.redNum).toBe(0);
            let childNode1 = rootNode.addNode("parent/child1", true);
            let childNode2 = rootNode.addNode("parent/child2", true);
            expect(parentNode.redNum).toBe(0);
            childNode1.redNum = 2;
            expect(parentNode.redNum).toBe(2);
            childNode2.redNum = 3;
            expect(parentNode.redNum).toBe(5);
        });
        
        test("isNum(false): parent renNum is one, if children's redNum is greater than 0", () => {
            let rootNode = new RedDotTreeNode("", true);
            let parentNode = rootNode.addNode("parent", false);
            expect(parentNode.redNum).toBe(0);
            let childNode1 = rootNode.addNode("parent/child1", true);
            let childNode2 = rootNode.addNode("parent/child2", true);
            expect(parentNode.redNum).toBe(0);
            childNode1.redNum = 2;
            expect(parentNode.redNum).toBe(1);
            childNode2.redNum = 3;
            expect(parentNode.redNum).toBe(1);
        });
    });

    describe("Callback", () => {
        test("setCallback() once is ok", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            let ret = newNode.setCallback((redNum: number) => {})
            expect(ret).toBeTruthy();
        });
        
        test("setCallback() twice is not allowed", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            newNode.setCallback((redNum: number) => {})
            let ret = newNode.setCallback((redNum: number) => {})
            expect(ret).toBeFalsy();
        });
        
        test("setCallback() after setCallback(null) is ok", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            newNode.setCallback((redNum: number) => {})
            newNode.setCallback(null)
            let ret = newNode.setCallback((redNum: number) => {})
            expect(ret).toBeTruthy();
        });

        test("Callback is called just after setCallback()", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            newNode.redNum = 3;
            newNode.setCallback((redNum: number) => {
                expect(redNum).toBe(3);
            })
        });
        
        test("Leaf node callback is called after value change", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNode = rootNode.addNode("level1", true);
            let callbackTimes = 0;
            newNode.setCallback((redNum: number) => {
                if(callbackTimes == 0) {
                    expect(redNum).toBe(0);
                }
                callbackTimes = callbackTimes + 1;
            })
            newNode.redNum = 1;
        });
        
        test("Parent node callback is called after leaf value change", () => {
            let rootNode = new RedDotTreeNode("", true);
            let newNodeParent = rootNode.addNode("level1", true);
            let newNodeLeaf = rootNode.addNode("level1/level2", true);
            let callbackTimes = 0;
            newNodeParent.setCallback((redNum: number) => {
                if(callbackTimes > 0) {
                    expect(redNum).toBe(1);
                }
                callbackTimes = callbackTimes + 1;
            })
            newNodeLeaf.redNum = 1;
        });
    });
});
