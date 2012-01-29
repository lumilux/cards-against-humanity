//
//  CardsViewController.h
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/29/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

@class WhiteCardsViewController;
@class BlackCardsViewController;

@interface CardsViewController : UITabBarController {
    UITabBar *cardBar;
    WhiteCardsViewController *white;
    BlackCardsViewController *black;
    
}
@property (strong, nonatomic) IBOutlet UITabBar *cardBar;
@property (strong, nonatomic) IBOutlet WhiteCardsViewController *white;
@property (strong, nonatomic) IBOutlet BlackCardsViewController *black;

@end
