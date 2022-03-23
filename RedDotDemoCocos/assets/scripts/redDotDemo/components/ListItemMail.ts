
import { _decorator, Component, Node, Label, Button } from 'cc';
import { RedDotManager } from '../logic/RedDotManager';
import { MailItem, MailWindow } from './ui/window/MailWindow';
const { ccclass, property } = _decorator;

/**
 *
 */
 
@ccclass('ListItemMail')
export class ListItemMail extends Component {

    @property(Label)
    titleLabel: Label = null;
    
    @property(Node)
    redDotNode: Node = null;

    private mailIndex: number = 0;
    private parentWindow: MailWindow = null;

    start () {
        // [3]
        this.node.on(Button.EventType.CLICK, this.onClick, this);
    }

    public init(id: number, data: MailItem, parentWindow: MailWindow) {
        this.mailIndex = id;
        this.titleLabel.string = data.title;
        this.redDotNode.active = true;
        this.parentWindow = parentWindow;

        let redDotPath = "MailButton/Mail" + this.mailIndex;
        RedDotManager.redDotTree.addNode(redDotPath, false);
        RedDotManager.redDotTree.changeRedDotState(redDotPath, true);
        RedDotManager.redDotTree.registerCallback(redDotPath, this.onRedNumChanged.bind(this));
    }

    protected onClick() {
        // 点击之后，修改已读状态，即红点数值变成0
        RedDotManager.redDotTree.changeRedDotState("MailButton/Mail" + this.mailIndex, false);
        this.parentWindow.setCurrentItem(this.mailIndex);
    }

    private onRedNumChanged(redNum: number) {
        this.redDotNode.active = redNum > 0;
    }
}
