
import { _decorator, Component, Node, Button } from 'cc';
import { RedDotManager } from '../../../logic/RedDotManager';
const { ccclass, property } = _decorator;

/**
 *
 */
 
@ccclass('BulletsWindow')
export class BulletsWindow extends Component {

    @property(Button)
    bulletButton1: Button;
    @property(Node)
    bullet1RedDot: Node;
    
    @property(Button)
    bulletButton2: Button;
    @property(Node)
    bullet2RedDot: Node;

    @property(Button)
    bulletButton3: Button;
    @property(Node)
    bullet3RedDot: Node;

    start () {
        RedDotManager.redDotTree.registerCallback("BulletsButton/Bullet1", this.onRedDotBullet1.bind(this));
        RedDotManager.redDotTree.registerCallback("BulletsButton/Bullet2", this.onRedDotBullet2.bind(this));
        RedDotManager.redDotTree.registerCallback("BulletsButton/Bullet3", this.onRedDotBullet3.bind(this));
    }

    protected onBulletButton1Clicked() {
        this.bulletButton1.interactable = false;
        RedDotManager.redDotTree.changeRedDotNum("BulletsButton/Bullet1", 0);
    }

    private onRedDotBullet1(redNum: number) {
        this.bullet1RedDot.active = redNum > 0;
    }
    
    protected onBulletButton2Clicked() {
        this.bulletButton2.interactable = false;
        RedDotManager.redDotTree.changeRedDotNum("BulletsButton/Bullet2", 0);
    }

    private onRedDotBullet2(redNum: number) {
        this.bullet2RedDot.active = redNum > 0;
    }
    protected onBulletButton3Clicked() {
        this.bulletButton3.interactable = false;
        RedDotManager.redDotTree.changeRedDotNum("BulletsButton/Bullet3", 0);
    }

    private onRedDotBullet3(redNum: number) {
        this.bullet3RedDot.active = redNum > 0;
    }
}
