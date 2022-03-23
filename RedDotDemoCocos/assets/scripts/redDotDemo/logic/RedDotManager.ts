import { RedDotTree } from "../../thirdParty/redDotTree/RedDotTree";

export class RedDotManager {
    public static redDotTree: RedDotTree = null;

    public static init() {
        this.redDotTree = new RedDotTree();
    }
}