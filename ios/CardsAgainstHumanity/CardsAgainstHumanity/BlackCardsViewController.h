//
//  BlackCardsViewController.h
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/29/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface BlackCardsViewController : UIViewController
{
    NSString *blackCard;
    NSArray *whiteCards;
}
@property (strong, nonatomic) NSArray *whiteCards;
@property (strong, nonatomic) NSString *blackCard;
@end
