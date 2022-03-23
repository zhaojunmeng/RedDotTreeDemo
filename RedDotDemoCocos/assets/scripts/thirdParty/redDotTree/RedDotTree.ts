import { RedDotTreeNode, RedDotCallback } from "./RedDotTreeNode";

export class RedDotTree {

    private rootNode = new RedDotTreeNode("", true);

    /**
     * 向红点树中添加新的节点
     * 暂时不支持添加父节点还不存在的节点，比如要成功添加"MailButton/Mail1"，就要求"MailButton"已经被添加过
     * 为什么不设计成添加"MailButton/Mail1"时，自动添加"MailButton"节点呢？
     * 主要是考虑到了"MailButton"节点的isNum属性，未必和"MailButton/Mail1"相同
     * @param redDotPath 使用"/"作为分隔符的红点节点路径
     * @param isNum 为true，红点的取值就是非负整数；为false，红点的取值就是0或1
     * @returns 返回新添加的节点，如果添加失败，则返回null
     */
    public addNode(redDotPath: string, isNum: boolean = true): RedDotTreeNode {
        return this.rootNode.addNode(redDotPath, isNum);
    }

    /**
     * 注册一个红点节点的回调。如果当前节点的回调方法不为null，注册会失败。
     * 为什么回调不是一个List呢？
     * 一是为了实现简单。二是一般UI界面上，一个红点就只对应一个UI控件。
     * @param redDotPath 使用"/"作为分隔符的红点节点路径
     * @param callback 回调方法
     * @returns 注册成功返回true，注册失败返回false
     */
    public registerCallback(redDotPath: string, callback: RedDotCallback): boolean {
        let node = this.rootNode.getNode(redDotPath);
        if(!node) {
            return false;
        }
        if(!node.setCallback(callback)) {
            RedDotTreeNode.logError(`RedDotTree: ${redDotPath} override existing callback failed:`)
            return false;
        }
        return true;
    }

    /**
     * 反注册一个红点节点的回调
     * @param redDotPath 使用"/"作为分隔符的红点节点路径
     */
    public unRegisterCallback(redDotPath: string) {
        this.registerCallback(redDotPath, null);
    }

    /**
     * 获取一个红点节点的当前值
     * @param redDotPath 使用"/"作为分隔符的红点节点路径
     * @returns 
     */
    public getRedDotNum(redDotPath: string): number {
        let node = this.rootNode.getNode(redDotPath);
        if(!node) {
            return -1;
        }
        return node.redNum;
    }

    /**
     * 修改一个红点节点的当前值
     * @param redDotPath 使用"/"作为分隔符的红点节点路径
     * @param newValue 新的红点值
     * @returns 修改成功返回true，修改失败或值没有变化返回false
     */
    public changeRedDotNum(redDotPath: string, newValue: number): boolean {
        let node = this.rootNode.getNode(redDotPath);
        if(node) {
            let oldValue = node.redNum;
            node.redNum = newValue;
            return oldValue != node.redNum;
        }
        return false;
    }

    /**
     * 修改一个红点节点的值，新的值非0即1。可以认为是changeRedDotNum()的便利方法
     * @param redDotPath 使用"/"作为分隔符的红点节点路径
     * @param newValue 新的红点显示状态，true即显示（值为1），false即不显示（值为0）
     * @returns 
     */
    public changeRedDotState(redDotPath: string, newValue: boolean): boolean {
        let newNum = newValue ? 1 : 0;
        return this.changeRedDotNum(redDotPath, newNum);
    }
}