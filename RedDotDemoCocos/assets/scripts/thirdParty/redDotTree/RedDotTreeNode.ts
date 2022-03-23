export type RedDotCallback = (redNum: number) => void;

export class RedDotTreeNode {
    public static errorFucntion = console.error;

    public static logError(...data: any[]) {
        if(RedDotTreeNode.errorFucntion) {
            this.errorFucntion(data);
        }
    }

    public readonly name: string;
    private children: Map<string, RedDotTreeNode> = new Map<string, RedDotTreeNode>();
    private parent: RedDotTreeNode = null;
    private isNum: boolean = true;
    private _redNum: number = 0;
    private callback: RedDotCallback = null;

    constructor(name: string, isNum: boolean) {
        this.name = name;
        this.isNum = isNum;
    }

    public get redNum(): number {
        return this._redNum;
    }

    public set redNum(newValue: number) {
        if(this.children.size > 0) {
            // 只有叶子结点的值可以改变，非叶子结点的值，都是根据child的值计算出来的
            RedDotTreeNode.logError(`RedDotTree: change the value of non leaf node is not allowed! ${this.name}`);
            return;
        }

        this.changeRedNum(newValue);
    }

    public addNode(subPath: string, isNum: boolean): RedDotTreeNode {
        let names = subPath.split("/");
        let parent: RedDotTreeNode = this;
        for (let index = 0; index < names.length - 1; index++) {
            const name = names[index];
            parent = parent.children.get(name);
            
            if(!parent) {
                // 这里不直接add一个child，主要是不知道需要add的node，isNum的属性该如何赋值
                RedDotTreeNode.logError(`RedDotTree: can't find parent ${name} of path ${subPath}`);
                return null;
            }
        }

        let childName = names[names.length - 1];
        if(parent.children.get(childName)) {
            RedDotTreeNode.logError(`RedDotTree: can't add the same node twice: ${subPath}`);
            return null;
        }
        let newNode = new RedDotTreeNode(childName, isNum);
        parent.children.set(childName, newNode);
        newNode.parent = parent;
        return newNode;
    }

    public getNode(subPath: string): RedDotTreeNode {
        let names = subPath.split("/");
        let node: RedDotTreeNode = this;
        for (let index = 0; index < names.length; index++) {
            const name = names[index];
            node = node.children.get(name);
            if(!node) {
                RedDotTreeNode.logError(`RedDotTree: can't find parent ${name} of path ${subPath}`);
                return null;
            }
        }
        return node;
    }

    public setCallback(callback: RedDotCallback): boolean {
        if (callback != null && this.callback != null) {
            return false;
        }
        this.callback = callback;
        // 为了方便UI使用，在注册回调的时候，就调用一次回调，让UI可以正确设置红点的状态
        this.doCallback()
        return true;
    }

    private changeRedNum(newValue: number) {
        if(newValue == this._redNum) {
            return;
        }

        let diffValue = newValue - this._redNum;

        this._redNum = newValue;
        this.doCallback();

        if(this.parent) {
            this.parent.changeDiffValueByChild(diffValue);
        }
    }

    private changeDiffValueByChild(diffValue: number) {
        let newValue = 0
        if(this.isNum) {
            newValue = this._redNum + diffValue;
        } else {
            // 非数字类型的红点，不能用diffValue来计算，需要遍历所有child来重新计算
            for (const child of this.children.values()) {
                if(child.redNum > 0) {
                    // 只要有一个child的value大于0，就可以break了
                    newValue = 1;
                    break;
                } 
            }
        }
        this.changeRedNum(newValue);
    }

    private doCallback() {
        if(this.callback) {
            this.callback(this._redNum);
        }
    }
}