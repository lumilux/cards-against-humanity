//
//  WhiteCardsViewController.h
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>
@class BlackCardsViewController;

@interface WhiteCardsViewController : UIViewController {
    NSArray *whiteCards;
    NSString *title;
    BlackCardsViewController *black;
}
@property (strong, nonatomic) NSArray *whiteCards;
@property (strong, nonatomic) BlackCardsViewController *black;
//@property (strong, nonatomic) NSString *title;

@end
