//
//  WhiteCardsViewController.m
//  CardsAgainstHumanity
//
//  Created by Vivek Bhagwat on 1/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "WhiteCardsViewController.h"
#import "BlackCardsViewController.h"

@interface WhiteCardsViewController ()  <UITabBarControllerDelegate>
//@property (strong, nonatomic) UITabBarController *tabBarController;
@end

@implementation WhiteCardsViewController
@synthesize whiteCards;
//@synthesize title;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        NSLog(@"init With Nib Name");
        self.title = NSLocalizedString(@"White", @"White");
        // Custom initialization
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    //get card Data
    whiteCards = [[NSArray alloc] initWithObjects:@"Masturbation", @"Friction", @"Sex", @"Golden Showers", nil];
    
    
//    [self. reloadData];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
    self.whiteCards = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

@end
